
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import the form context to access exit dialog functionality
import { useFormContext } from '@/components/requestForm/RequestFormProvider';

const Header = ({
  personName
}: {
  personName?: string;
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Try to get form context if available (only in request form routes)
  let formContext;
  try {
    formContext = useFormContext();
  } catch {
    // Not in a form context, continue with normal behavior
    formContext = null;
  }

  // Determine if we're in a guarantor form
  const isGuarantorForm = location.pathname.includes('/guarantors');

  // Get page title based on current path
  const getPageTitle = () => {
    const isEditRoute = location.pathname.includes('/edit');
    if (personName && isEditRoute) {
      return personName;
    }
    switch (location.pathname) {
      case '/prospects':
        return 'Prospectos';
      case '/applications':
        return 'Solicitudes';
      case '/alerts':
        return 'Alertas';
      case '/settings':
        return 'Ajustes';
      case '/login':
        return 'Iniciar Sesión';
      default:
        return 'Coopsama App';
    }
  };

  const handleGoBack = () => {
    if (location.pathname.includes('/edit')) {
      navigate('/applications');
    } else {
      navigate(-1);
    }
  };

  const handleExit = () => {
    // If we're in a form context (request form), use the form's exit handler
    if (formContext && location.pathname.includes('/edit')) {
      formContext.handleShowExitDialog();
    } else {
      // Default behavior for other routes
      if (location.pathname.includes('/edit')) {
        navigate('/applications');
      } else {
        navigate(-1);
      }
    }
  };

  return <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex h-14 items-center px-4 relative">
        {/* Left button area */}
        <div className="absolute left-4">
          {location.pathname.includes('/edit')}
        </div>
        
        {/* Centered title with form type indicator */}
        <div className="flex-1 flex justify-center items-center gap-2">
          <h1 className="text-lg font-bold text-primary">
            {getPageTitle()}
          </h1>
          {isGuarantorForm ? <Users className="h-4 w-4 text-accent" /> : location.pathname.includes('/applications')}
        </div>
        
        {/* Right button area */}
        <div className="absolute right-4">
          {location.pathname.includes('/edit') && <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={handleExit} aria-label="Cerrar">
              <X className="h-5 w-5" />
            </Button>}
        </div>
      </div>
    </header>;
};

export default Header;
