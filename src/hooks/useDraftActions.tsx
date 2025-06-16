
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";

// Hook para guardar borrador con soporte incremental
export const useSaveDraft = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      formData, 
      currentStep, 
      currentSubStep, 
      isIncremental = false, 
      changedData = null 
    }: { 
      formData: any; 
      currentStep: number; 
      currentSubStep?: number;
      isIncremental?: boolean;
      changedData?: any;
    }) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      console.log('💾 useSaveDraft: Saving draft', { 
        isIncremental, 
        formData: isIncremental ? changedData : formData, 
        currentStep, 
        currentSubStep 
      });
      
      // Construir el nombre del cliente desde diferentes fuentes posibles
      const clientName = formData?.fullName ||
                        formData?.identification?.fullName || 
                        formData?.personalInfo?.fullName || 
                        formData?.basicData?.fullName ||
                        (formData?.firstName && formData?.lastName ? `${formData.firstName} ${formData.lastName}` : '') ||
                        (formData?.identification?.firstName && formData?.identification?.lastName ? `${formData.identification.firstName} ${formData.identification.lastName}` : '') ||
                        formData?.firstName || 
                        'Sin nombre';
      
      console.log('👤 Extracted client name:', clientName);
      
      // Para guardado incremental, primero obtener datos existentes
      let finalDraftData = isIncremental && changedData ? changedData : formData;
      
      if (isIncremental && changedData) {
        // Buscar borrador existente para combinar datos
        const { data: existingDraft } = await supabase
          .from('application_drafts')
          .select('draft_data')
          .eq('agent_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (existingDraft) {
          // Combinar datos existentes con cambios
          finalDraftData = {
            ...existingDraft.draft_data,
            ...changedData
          };
          console.log('🔄 Combined existing draft with changes');
        } else {
          // Si no hay borrador existente, usar datos completos
          finalDraftData = formData;
          console.log('📝 No existing draft found, using full data');
        }
      }
      
      const draftPayload = {
        agent_id: user.id,
        client_name: clientName,
        draft_data: finalDraftData,
        last_step: currentStep,
        last_sub_step: currentSubStep || 0,
        updated_at: new Date().toISOString()
      };
      
      console.log('📦 Draft payload:', draftPayload);
      
      const { data, error } = await supabase
        .from('application_drafts')
        .upsert(draftPayload)
        .select()
        .single();
        
      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      console.log('✅ Draft saved successfully:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('🎉 Draft save success, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-drafts'] });
      
      const saveType = variables.isIncremental ? 'guardado incremental' : 'borrador guardado';
      
      toast({
        title: `${saveType.charAt(0).toUpperCase() + saveType.slice(1)}`,
        description: `Tu solicitud ha sido guardada (ID: ${data.id.slice(0, 8)}...)`,
        variant: "default",
        className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        duration: variables.isIncremental ? 2000 : 3000,
      });
    },
    onError: (error, variables) => {
      console.error('❌ Error saving draft:', error);
      const saveType = variables.isIncremental ? 'guardado incremental' : 'borrador';
      
      toast({
        title: `Error al guardar ${saveType}`,
        description: "No se pudo guardar el progreso. Inténtalo de nuevo.",
        variant: "destructive",
        duration: 3000
      });
    },
  });
};

// Hook para obtener borradores
export const useDrafts = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['application-drafts', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      const { data, error } = await supabase
        .from('application_drafts')
        .select('*')
        .eq('agent_id', user.id)
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};

// Hook para validación de datos mínimos con validación mejorada
export const useApplicationValidation = () => {
  const validateMinimumRequiredData = (formData: any): { isValid: boolean; missingFields: string[] } => {
    const missingFields: string[] = [];
    
    console.log('🔍 Validating minimum required data:', formData);
    
    // Validar nombre completo desde diferentes fuentes posibles
    const fullName = formData?.identification?.fullName || 
                    formData?.personalInfo?.fullName || 
                    formData?.basicData?.fullName ||
                    formData?.fullName ||
                    (formData?.firstName && formData?.lastName ? `${formData.firstName} ${formData.lastName}` : '') ||
                    (formData?.identification?.firstName && formData?.identification?.lastName ? `${formData.identification.firstName} ${formData.identification.lastName}` : '') ||
                    formData?.firstName;
    
    // Validación más estricta del nombre
    if (!fullName || fullName.trim().length < 2) {
      missingFields.push('Nombre completo (mínimo 2 caracteres)');
    }
    
    // Validar que el nombre contenga al menos nombre y apellido
    const nameParts = fullName?.trim().split(' ').filter(part => part.length > 0) || [];
    if (nameParts.length < 2) {
      missingFields.push('Apellidos (se requiere nombre y apellido completos)');
    }
    
    console.log('✅ Validation result:', { 
      fullName, 
      nameParts, 
      isValid: missingFields.length === 0, 
      missingFields 
    });
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };

  return { validateMinimumRequiredData };
};
