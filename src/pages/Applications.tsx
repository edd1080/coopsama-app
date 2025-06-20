
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import PrequalificationModal from '@/components/prequalification/PrequalificationModal';
import CancelApplicationBottomSheet from '@/components/applications/CancelApplicationBottomSheet';
import ApplicationsHeader from '@/components/applications/ApplicationsHeader';
import ApplicationsFilter from '@/components/applications/ApplicationsFilter';
import ApplicationsList from '@/components/applications/ApplicationsList';
import CreateTestApplicationButton from '@/components/applications/CreateTestApplicationButton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useApplications } from '@/hooks/useSupabaseQuery';
import { useDeleteApplication } from '@/hooks/useApplicationActions';

const Applications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPrequalificationModal, setShowPrequalificationModal] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelBottomSheetOpen, setCancelBottomSheetOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<{ id: string; clientName: string; isDraft?: boolean } | null>(null);
  
  // Obtener aplicaciones reales de la base de datos
  const { data: applications = [], isLoading, error } = useApplications();
  const deleteMutation = useDeleteApplication();

  const handleEditApplication = (id: string, clientName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate(`/applications/${id}/edit`);
    toast({
      title: "Edición iniciada",
      description: `Editando solicitud ${id}`,
      duration: 3000
    });
  };

  const handleCancelApplication = (id: string, clientName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedApplication({ id, clientName });
    setCancelBottomSheetOpen(true);
  };

  const handleDeleteApplication = (id: string, clientName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Determinar si es borrador basándose en el tipo de aplicación
    // Los borradores tienen isDraft: true
    const application = applications.find(app => app.id === id);
    const isDraft = application?.isDraft || false;
    
    setSelectedApplication({ id, clientName, isDraft });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedApplication) {
      deleteMutation.mutate({ 
        applicationId: selectedApplication.id, 
        isDraft: selectedApplication.isDraft 
      });
      setDeleteDialogOpen(false);
      setSelectedApplication(null);
    }
  };

  const filteredApplications = applications.filter(application => {
    if (activeStatusFilter === 'all') return true;
    if (activeStatusFilter === 'active') return application.status === 'pending';
    if (activeStatusFilter === 'verification') return application.status === 'reviewing';
    return application.status === activeStatusFilter;
  });

  const getStatusCounts = () => {
    return {
      all: applications.length,
      active: applications.filter(app => app.status === 'pending').length,
      verification: applications.filter(app => app.status === 'reviewing').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
    };
  };

  const statusCounts = getStatusCounts();

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 px-4 py-4 pb-20">
          <div className="text-center py-12">
            <p className="text-red-500">Error al cargar solicitudes: {error.message}</p>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 px-4 py-4 pb-20 space-y-6">
        <ApplicationsHeader />

        {/* Botón para crear solicitud de prueba - solo en desarrollo */}
        <div className="flex justify-center">
          <CreateTestApplicationButton />
        </div>

        <ApplicationsFilter
          activeStatusFilter={activeStatusFilter}
          onStatusFilterChange={setActiveStatusFilter}
          statusCounts={statusCounts}
        >
          <ApplicationsList
            applications={filteredApplications}
            isLoading={isLoading}
            onEdit={handleEditApplication}
            onCancel={handleCancelApplication}
            onDelete={handleDeleteApplication}
          />
        </ApplicationsFilter>
      </main>
      
      <BottomNavigation />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {selectedApplication?.isDraft ? 'borrador' : 'solicitud'}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. {selectedApplication?.isDraft ? 'El borrador' : 'La solicitud'} de {selectedApplication?.clientName} será eliminado permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Application Bottom Sheet */}
      {selectedApplication && (
        <CancelApplicationBottomSheet
          open={cancelBottomSheetOpen}
          onOpenChange={setCancelBottomSheetOpen}
          applicationId={selectedApplication.id}
          clientName={selectedApplication.clientName}
        />
      )}
      
      <PrequalificationModal open={showPrequalificationModal} onOpenChange={setShowPrequalificationModal} />
    </div>
  );
};

export default Applications;
