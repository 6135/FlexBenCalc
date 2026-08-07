import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Priority, HealthPlanType, AppState } from './types';
import { defaults } from './constants';
import { useHealthInsuranceCalculations } from './hooks/useHealthInsuranceCalculations';
import { useAllocationCalculations } from './hooks/useAllocationCalculations';
import { DisclaimerModal } from './components/DisclaimerModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { PrintDisclaimer } from './components/PrintDisclaimer';
import { Configurator } from './components/Configurator';
import { SummaryStats } from './components/SummaryStats';
import { PriorityList } from './components/PriorityList';
import { AllocationMatrix } from './components/AllocationMatrix';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ShareModal } from './components/ShareModal';
import { SharedConfigBanner } from './components/SharedConfigBanner';
import { migrateConfig, CURRENT_CONFIG_VERSION } from './utils/configMigration';
import { generateShareUrl, decodeBase64ToState } from './utils/shareUtils';
import { grantConsent, revokeConsent, trackEvent } from './utils/analytics';

const App: React.FC = () => {
  const { sharedData } = useParams<{ sharedData?: string }>();
  const navigate = useNavigate();

  // Load from localStorage or use defaults
  const loadState = (): AppState => {
    try {
      const saved = localStorage.getItem('benefitsAllocatorState');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults, ensuring undefined values don't override defaults
        return {
          ...defaults,
          ...Object.fromEntries(
            Object.entries(parsed).filter(([_, v]) => v !== undefined)
          )
        } as AppState;
      }
      return defaults;
    } catch (e) {
      console.error('Error loading state:', e);
      return defaults;
    }
  };

  // Load shared state if present in URL
  const loadSharedState = (): AppState | null => {
    if (sharedData) {
      const decodedState = decodeBase64ToState(sharedData);
      if (decodedState) {
        return migrateConfig(decodedState);
      }
    }
    return null;
  };

  const sharedState = loadSharedState();
  const initialState = sharedState || loadState();

  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(true); // Always show on load
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showSharedBanner, setShowSharedBanner] = useState<boolean>(!!sharedState);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [totalBudget, setTotalBudget] = useState<number>(initialState.totalBudget);
  const [numMonths, setNumMonths] = useState<number>(initialState.numMonths);
  const [customMonths, setCustomMonths] = useState<boolean>(initialState.customMonths);
  const [startInDecember, setStartInDecember] = useState<boolean>(initialState.startInDecember);
  const [carAllowance, setCarAllowance] = useState<number>(initialState.carAllowance);
  const [bonus, setBonus] = useState<number>(initialState.bonus);
  const [healthPlan, setHealthPlan] = useState<HealthPlanType>(initialState.healthPlan);
  const [employeeIncluded, setEmployeeIncluded] = useState<boolean>(initialState.employeeIncluded);
  const [spouseIncluded, setSpouseIncluded] = useState<boolean>(initialState.spouseIncluded);
  const [dependentsUnder25, setDependentsUnder25] = useState<number>(initialState.dependentsUnder25);
  const [dependents25Plus, setDependents25Plus] = useState<number>(initialState.dependents25Plus);
  const [priorities, setPriorities] = useState<Priority[]>(initialState.priorities);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // Save to localStorage whenever state changes (showDisclaimer excluded - always shows on load)
  // Don't save if we're viewing a shared configuration
  useEffect(() => {
    // Don't save to localStorage when viewing shared data
    if (sharedData && showSharedBanner) {
      return;
    }

    const stateToSave: AppState = {
      showDisclaimer: false, // Not persisted
      totalBudget,
      numMonths,
      customMonths,
      startInDecember,
      carAllowance,
      bonus,
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
  }, [totalBudget, numMonths, customMonths, startInDecember, carAllowance, bonus, healthPlan, 
      employeeIncluded, spouseIncluded, dependentsUnder25, dependents25Plus, priorities, sharedData, showSharedBanner]);

  // Reset function
  const resetToDefaults = (): void => {
    setTotalBudget(defaults.totalBudget);
    setNumMonths(defaults.numMonths);
    setCustomMonths(defaults.customMonths);
    setStartInDecember(defaults.startInDecember);
    setCarAllowance(defaults.carAllowance);
    setBonus(defaults.bonus);
    setHealthPlan(defaults.healthPlan);
    setEmployeeIncluded(defaults.employeeIncluded);
    setSpouseIncluded(defaults.spouseIncluded);
    setDependentsUnder25(defaults.dependentsUnder25);
    setDependents25Plus(defaults.dependents25Plus);
    setPriorities(defaults.priorities);
    localStorage.removeItem('benefitsAllocatorState');
    setShowResetConfirm(false);
    trackEvent('reset_to_defaults');
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

  // Effective budget includes the negative employee contribution (when company owes credits back) and car allowance
  const effectiveBudget: number = useMemo(() => {
    const creditBack = healthInsuranceCosts.employeeContribution < 0 ? Math.abs(healthInsuranceCosts.employeeContribution) : 0;
    return totalBudget + creditBack + carAllowance;
  }, [totalBudget, healthInsuranceCosts.employeeContribution, carAllowance]);

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
    allPriorities,
    bonus
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
      p.id === id ? { ...p, [field]: field === 'yearlyAmount' ? Number.parseFloat(value as string) || 0 : value } : p
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
    trackEvent('print');
    globalThis.print();
  };

  const handleExport = (): void => {
    const exportData: AppState = {
      version: CURRENT_CONFIG_VERSION,
      showDisclaimer: false,
      totalBudget,
      numMonths,
      customMonths,
      startInDecember,
      carAllowance,
      bonus,
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
    const timestamp = new Date().toISOString().replaceAll(':', '-').replace(/\.\..+/, '');
    link.download = `flexben-config-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    trackEvent('export_config');
  };

  const handleImport = (): void => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const rawData = JSON.parse(text);

        // Migrate configuration to current version
        const importedData = migrateConfig(rawData);

        // Apply migrated data
        const importFieldSetters: Partial<{ [K in keyof AppState]: (value: AppState[K]) => void }> = {
          totalBudget: setTotalBudget,
          numMonths: setNumMonths,
          customMonths: setCustomMonths,
          startInDecember: setStartInDecember,
          carAllowance: setCarAllowance,
          bonus: setBonus,
          healthPlan: setHealthPlan,
          employeeIncluded: setEmployeeIncluded,
          spouseIncluded: setSpouseIncluded,
          dependentsUnder25: setDependentsUnder25,
          dependents25Plus: setDependents25Plus,
          priorities: setPriorities,
        };
        (Object.keys(importFieldSetters) as (keyof AppState)[]).forEach((key) => {
          const value = importedData[key];
          if (value !== undefined) {
            (importFieldSetters[key] as (v: unknown) => void)(value);
          }
        });

        let versionMessage = '';
        if (rawData.version) {
          if (rawData.version < CURRENT_CONFIG_VERSION) {
            versionMessage = ` (migrated from version ${rawData.version})`;
          }
        } else {
          versionMessage = ' (migrated from version 1)';
        }
        alert(`Configuration imported successfully${versionMessage}!`);
        trackEvent('import_config');
      } catch (error) {
        console.error('Error importing file:', error);
        alert('Error importing file. Please ensure it is a valid JSON file.');
      }
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
    trackEvent('auto_balance');
  };

  const handleShare = (): void => {
    const exportData: AppState = {
      version: CURRENT_CONFIG_VERSION,
      showDisclaimer: false,
      totalBudget,
      numMonths,
      customMonths,
      startInDecember,
      carAllowance,
      bonus,
      healthPlan,
      employeeIncluded,
      spouseIncluded,
      dependentsUnder25,
      dependents25Plus,
      priorities
    };

    const url = generateShareUrl(exportData);
    setShareUrl(url);
    setShowShareModal(true);
    trackEvent('share_link_created');
  };

  const handleImportSharedConfig = (): void => {
    // Import the shared config into localStorage
    if (sharedState) {
      setTotalBudget(sharedState.totalBudget);
      setNumMonths(sharedState.numMonths);
      setCustomMonths(sharedState.customMonths);
      setStartInDecember(sharedState.startInDecember);
      setCarAllowance(sharedState.carAllowance);
      setBonus(sharedState.bonus);
      setHealthPlan(sharedState.healthPlan);
      setEmployeeIncluded(sharedState.employeeIncluded);
      setSpouseIncluded(sharedState.spouseIncluded);
      setDependentsUnder25(sharedState.dependentsUnder25);
      setDependents25Plus(sharedState.dependents25Plus);
      setPriorities(sharedState.priorities);
      
      setShowSharedBanner(false);
      navigate('/');
      alert('Shared configuration has been imported into your saved data!');
      trackEvent('shared_config_imported');
    }
  };

  const handleDismissSharedBanner = (): void => {
    setShowSharedBanner(false);
  };

  const handleReturnToMyData = (): void => {
    // Load data from localStorage
    const localData = loadState();
    
    setTotalBudget(localData.totalBudget);
    setNumMonths(localData.numMonths);
    setCustomMonths(localData.customMonths);
    setStartInDecember(localData.startInDecember);
    setCarAllowance(localData.carAllowance);
    setBonus(localData.bonus);
    setHealthPlan(localData.healthPlan);
    setEmployeeIncluded(localData.employeeIncluded);
    setSpouseIncluded(localData.spouseIncluded);
    setDependentsUnder25(localData.dependentsUnder25);
    setDependents25Plus(localData.dependents25Plus);
    setPriorities(localData.priorities);
    
    setShowSharedBanner(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <PrintDisclaimer />
      
      <DisclaimerModal
        show={showDisclaimer}
        onAccept={() => setShowDisclaimer(false)}
        onAcceptCookies={grantConsent}
        onRejectCookies={revokeConsent}
      />
      
      <ResetConfirmModal
        show={showResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={resetToDefaults}
      />

      <ShareModal
        show={showShareModal}
        shareUrl={shareUrl}
        onClose={() => setShowShareModal(false)}
      />

      <div className="max-w-7xl mx-auto">
        <Header 
          onPrint={handlePrint}
          onReset={() => setShowResetConfirm(true)}
          onExport={handleExport}
          onImport={handleImport}
          onShare={handleShare}
        />

        {showSharedBanner && (
          <SharedConfigBanner
            onImport={handleImportSharedConfig}
            onDismiss={handleDismissSharedBanner}
            onReturnToMyData={handleReturnToMyData}
          />
        )}
        
        {/* Configuration Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuration</h2>
          
          <Configurator
            totalBudget={totalBudget}
            numMonths={numMonths}
            customMonths={customMonths}
            startInDecember={startInDecember}
            carAllowance={carAllowance}
            bonus={bonus}
            monthlyAllowance={monthlyAllowance}
            healthPlan={healthPlan}
            employeeIncluded={employeeIncluded}
            spouseIncluded={spouseIncluded}
            dependentsUnder25={dependentsUnder25}
            dependents25Plus={dependents25Plus}
            effectiveBudget={effectiveBudget}
            healthInsuranceCosts={healthInsuranceCosts}
            onTotalBudgetChange={setTotalBudget}
            onCustomMonthsChange={setCustomMonths}
            onNumMonthsChange={setNumMonths}
            onStartInDecemberChange={setStartInDecember}
            onCarAllowanceChange={setCarAllowance}
            onBonusChange={setBonus}
            onHealthPlanChange={setHealthPlan}
            onEmployeeIncludedChange={setEmployeeIncluded}
            onSpouseIncludedChange={setSpouseIncluded}
            onDependentsUnder25Change={setDependentsUnder25}
            onDependents25PlusChange={setDependents25Plus}
          />

          <SummaryStats
            totalBudget={totalBudget}
            effectiveBudget={effectiveBudget}
            healthInsuranceCosts={healthInsuranceCosts}
            allPriorities={allPriorities}
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
          bonus={bonus}
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