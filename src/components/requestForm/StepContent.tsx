
import React from 'react';
import { useFormContext } from './RequestFormProvider';
import IdentificationContact from './IdentificationContact';
import FinancialInfo from './FinancialInfo';
import BusinessEconomicProfile from './BusinessEconomicProfile';
import GuarantorsSection from './GuarantorsSection';
import PhotoDocumentUpload from './PhotoDocumentUpload';
import ReviewSection from './ReviewSection';
import FormTypeBanner from '../forms/FormTypeBanner';

const StepContent: React.FC = () => {
  const { activeStep, formData, updateFormData, isInGuarantorForm } = useFormContext();

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <IdentificationContact formData={formData} updateFormData={updateFormData} />;
      case 1:
        return <FinancialInfo formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <BusinessEconomicProfile formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <GuarantorsSection formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <PhotoDocumentUpload formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <ReviewSection formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  // Determine form type based on current section and state
  const getFormType = () => {
    if (activeStep === 3 && isInGuarantorForm) {
      return 'guarantor';
    }
    return 'applicant';
  };

  return (
    <div className="mb-24">
      {/* Only show banner for guarantor forms */}
      {activeStep === 3 && isInGuarantorForm && (
        <div className="mb-6">
          <FormTypeBanner type={getFormType()} />
        </div>
      )}
      {renderStepContent()}
    </div>
  );
};

export default StepContent;
