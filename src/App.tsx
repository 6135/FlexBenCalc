import React, { useState, useMemo, useEffect } from 'react';
import { Priority, HealthPlanType, AppState } from './types';
import { defaults } from './constants';
import { useHealthInsuranceCalculations } from './hooks/useHealthInsuranceCalculations';
import { useAllocationCalculations } from './hooks/useAllocationCalculations';
import { DisclaimerModal } from './components/DisclaimerModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { PrintDisclaimer } from './components/PrintDisclaimer';
import { BudgetConfiguration } from './components/BudgetConfiguration';
import { SummaryStats } from './components/SummaryStats';
import { HealthInsuranceConfig } from './components/HealthInsuranceConfig';
import { PriorityList } from './components/PriorityList';
import { AllocationMatrix } from './components/AllocationMatrix';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

const App: React.FC = () => {

  // Load from localStorage or use defaults
  const loadState = (): AppState => {
    try {
      const saved = localStorage.getItem('benefitsAllocatorState');
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch (e) {
      console.error('Error loading state:', e);
      return defaults;
    }
  };

  const initialState = loadState();

  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(true); // Always show on load
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [totalBudget, setTotalBudget] = useState<number>(initialState.totalBudget);
  const [numMonths, setNumMonths] = useState<number>(initialState.numMonths);
  const [customMonths, setCustomMonths] = useState<boolean>(initialState.customMonths);
  const [startInDecember, setStartInDecember] = useState<boolean>(initialState.startInDecember);
  const [carAllowance, setCarAllowance] = useState<number>(initialState.carAllowance);
  const [healthPlan, setHealthPlan] = useState<HealthPlanType>(initialState.healthPlan);
  const [employeeIncluded, setEmployeeIncluded] = useState<boolean>(initialState.employeeIncluded);
  const [spouseIncluded, setSpouseIncluded] = useState<boolean>(initialState.spouseIncluded);
  const [dependentsUnder25, setDependentsUnder25] = useState<number>(initialState.dependentsUnder25);
  const [dependents25Plus, setDependents25Plus] = useState<number>(initialState.dependents25Plus);
  const [priorities, setPriorities] = useState<Priority[]>(initialState.priorities);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // Save to localStorage whenever state changes (showDisclaimer excluded - always shows on load)
  useEffect(() => {
    const stateToSave: AppState = {
      showDisclaimer: false, // Not persisted
      totalBudget,
      numMonths,
      customMonths,
      startInDecember,
      carAllowance,
      healthPlan,
      employeeIncluded,
      spouseIncluded,
      dependentsUnder25,
      dependents25Plus,
      priorities
    };
    try {
      localStorage.setItem('benefitsAllocatorState', JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }, [totalBudget, numMonths, customMonths, startInDecember, carAllowance, healthPlan, 
      employeeIncluded, spouseIncluded, dependentsUnder25, dependents25Plus, priorities]);

  // Reset function
  const resetToDefaults = (): void => {
    setTotalBudget(defaults.totalBudget);
    setNumMonths(defaults.numMonths);
    setCustomMonths(defaults.customMonths);
    setStartInDecember(defaults.startInDecember);
    setCarAllowance(defaults.carAllowance);
    setHealthPlan(defaults.healthPlan);
    setEmployeeIncluded(defaults.employeeIncluded);
    setSpouseIncluded(defaults.spouseIncluded);
    setDependentsUnder25(defaults.dependentsUnder25);
    setDependents25Plus(defaults.dependents25Plus);
    setPriorities(defaults.priorities);
    localStorage.removeItem('benefitsAllocatorState');
    setShowResetConfirm(false);
  };

  // Calculate health insurance costs and priorities using hook
  const { healthInsurancePriorities, healthInsuranceCosts } = useHealthInsuranceCalculations(
    healthPlan,
    employeeIncluded,
    spouseIncluded,
    dependentsUnder25,
    dependents25Plus
  );

  // Combine health insurance priorities with user priorities
  const allPriorities = useMemo((): Priority[] => 
    [...healthInsurancePriorities, ...priorities],
    [healthInsurancePriorities, priorities]
  );

  // Effective budget includes the negative employee contribution (when company owes credits back)
  const effectiveBudget: number = useMemo(() => {
    const creditBack = healthInsuranceCosts.employeeContribution < 0 ? Math.abs(healthInsuranceCosts.employeeContribution) : 0;
    return totalBudget + creditBack;
  }, [totalBudget, healthInsuranceCosts.employeeContribution]);

  const monthlyAllowance: number = effectiveBudget / numMonths;

  const monthNames: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getMonthLabel = (monthIndex: number): string => {
    if (numMonths === 12) {
      if (startInDecember) {
        // December to November: Dec, Jan, Feb, ..., Nov
        const adjustedIndex = (monthIndex + 11) % 12; // Start from December (index 11)
        return monthNames[adjustedIndex];
      }
      return monthNames[monthIndex];
    }
    return `Month ${monthIndex + 1}`;
  };

  // Calculate allocation using hook
  const { calculateAllocation, totalSurplus } = useAllocationCalculations(
    monthlyAllowance,
    numMonths,
    allPriorities
  );

  const addPriority = (): void => {
    const newId = Math.max(...priorities.map(p => p.id), 0) + 1;
    setPriorities([...priorities, { id: newId, name: `Priority ${newId}`, yearlyAmount: 0 }]);
  };

  const removePriority = (id: number): void => {
    setPriorities(priorities.filter(p => p.id !== id));
  };

  const updatePriority = (id: number, field: keyof Priority, value: string | number): void => {
    setPriorities(priorities.map(p => 
      p.id === id ? { ...p, [field]: field === 'yearlyAmount' ? parseFloat(value as string) || 0 : value } : p
    ));
  };

  const handleDragStart = (index: number): void => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number): void => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;
    
    const newPriorities = [...priorities];
    const draggedPriority = newPriorities[draggedItem];
    newPriorities.splice(draggedItem, 1);
    newPriorities.splice(index, 0, draggedPriority);
    
    setPriorities(newPriorities);
    setDraggedItem(index);
  };

  const handleDragEnd = (): void => {
    setDraggedItem(null);
  };

  const handlePrint = (): void => {
    window.print();
  };

  const handleExport = (): void => {
    const exportData: AppState = {
      showDisclaimer: false,
      totalBudget,
      numMonths,
      customMonths,
      startInDecember,
      carAllowance,
      healthPlan,
      employeeIncluded,
      spouseIncluded,
      dependentsUnder25,
      dependents25Plus,
      priorities
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flexben-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (): void => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          const importedData = JSON.parse(event.target?.result as string) as AppState;
          
          // Validate and apply imported data
          if (importedData.totalBudget !== undefined) setTotalBudget(importedData.totalBudget);
          if (importedData.numMonths !== undefined) setNumMonths(importedData.numMonths);
          if (importedData.customMonths !== undefined) setCustomMonths(importedData.customMonths);
          if (importedData.startInDecember !== undefined) setStartInDecember(importedData.startInDecember);
          if (importedData.carAllowance !== undefined) setCarAllowance(importedData.carAllowance);
          if (importedData.healthPlan !== undefined) setHealthPlan(importedData.healthPlan);
          if (importedData.employeeIncluded !== undefined) setEmployeeIncluded(importedData.employeeIncluded);
          if (importedData.spouseIncluded !== undefined) setSpouseIncluded(importedData.spouseIncluded);
          if (importedData.dependentsUnder25 !== undefined) setDependentsUnder25(importedData.dependentsUnder25);
          if (importedData.dependents25Plus !== undefined) setDependents25Plus(importedData.dependents25Plus);
          if (importedData.priorities !== undefined) setPriorities(importedData.priorities);
          
          alert('Configuration imported successfully!');
        } catch (error) {
          console.error('Error importing file:', error);
          alert('Error importing file. Please ensure it is a valid JSON file.');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  const handleAutoBalanceLast = (): void => {
    // Calculate total requested amount from all priorities
    const totalRequested = allPriorities.reduce((sum, p) => sum + p.yearlyAmount, 0);
    const totalAvailable = effectiveBudget;
    const difference = totalAvailable - totalRequested;

    if (Math.abs(difference) < 0.01) {
      return; // Already balanced
    }

    const updatedPriorities = [...priorities];
    let remainingAdjustment = difference;

    // Work backwards through user priorities (not health insurance) with value > 0
    for (let i = updatedPriorities.length - 1; i >= 0 && Math.abs(remainingAdjustment) > 0.01; i--) {
      if (updatedPriorities[i].yearlyAmount > 0) {
        const currentAmount = updatedPriorities[i].yearlyAmount;
        const newAmount = currentAmount + remainingAdjustment;

        if (newAmount >= 0) {
          // This priority can absorb all remaining adjustment
          updatedPriorities[i] = {
            ...updatedPriorities[i],
            yearlyAmount: Number(newAmount.toFixed(2))
          };
          remainingAdjustment = 0;
        } else {
          // This priority can only be reduced to 0, continue to next priority
          updatedPriorities[i] = {
            ...updatedPriorities[i],
            yearlyAmount: 0
          };
          remainingAdjustment = newAmount; // Carry over the remaining negative amount
        }
      }
    }

    setPriorities(updatedPriorities);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <PrintDisclaimer />
      
      <DisclaimerModal 
        show={showDisclaimer} 
        onAccept={() => setShowDisclaimer(false)} 
      />
      
      <ResetConfirmModal
        show={showResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={resetToDefaults}
      />

      <div className="max-w-7xl mx-auto">
        <Header 
          onPrint={handlePrint}
          onReset={() => setShowResetConfirm(true)}
          onExport={handleExport}
          onImport={handleImport}
        />
        
        {/* Configuration Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuration</h2>
          
          <BudgetConfiguration
            totalBudget={totalBudget}
            numMonths={numMonths}
            customMonths={customMonths}
            startInDecember={startInDecember}
            monthlyAllowance={monthlyAllowance}
            onTotalBudgetChange={setTotalBudget}
            onCustomMonthsChange={setCustomMonths}
            onNumMonthsChange={setNumMonths}
            onStartInDecemberChange={setStartInDecember}
          />

          <SummaryStats
            totalBudget={totalBudget}
            effectiveBudget={effectiveBudget}
            healthInsuranceCosts={healthInsuranceCosts}
            allPriorities={allPriorities}
          />

          <HealthInsuranceConfig
            healthPlan={healthPlan}
            employeeIncluded={employeeIncluded}
            spouseIncluded={spouseIncluded}
            dependentsUnder25={dependentsUnder25}
            dependents25Plus={dependents25Plus}
            totalBudget={totalBudget}
            effectiveBudget={effectiveBudget}
            healthInsuranceCosts={healthInsuranceCosts}
            onHealthPlanChange={setHealthPlan}
            onEmployeeIncludedChange={setEmployeeIncluded}
            onSpouseIncludedChange={setSpouseIncluded}
            onDependentsUnder25Change={setDependentsUnder25}
            onDependents25PlusChange={setDependents25Plus}
            onTotalBudgetChange={setTotalBudget}
          />
        </div>

        <PriorityList
          priorities={priorities}
          draggedItem={draggedItem}
          onAddPriority={addPriority}
          onRemovePriority={removePriority}
          onUpdatePriority={updatePriority}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        />

        <AllocationMatrix
          allPriorities={allPriorities}
          numMonths={numMonths}
          getMonthLabel={getMonthLabel}
          calculateAllocation={calculateAllocation}
          totalSurplus={totalSurplus}
          onAutoBalanceLast={handleAutoBalanceLast}
        />
      </div>

      <Footer />
    </div>
  );
};

export default App;