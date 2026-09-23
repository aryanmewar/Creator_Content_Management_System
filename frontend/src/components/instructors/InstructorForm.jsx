import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Select from '../common/Select.jsx';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  designation: z.string().optional(),
  customDesignation: z.string().optional(),
});

const getInitialDesignation = (des) => {
  if (!des) return 'Instructor';
  if (des === 'Instructor' || des === 'Creator') return des;
  return 'Other';
};

const getInitialCustom = (des) => {
  if (!des) return '';
  if (des === 'Instructor' || des === 'Creator') return '';
  return des;
};

const InstructorForm = ({ isOpen, onClose, onSubmit, instructor = null, isLoading = false }) => {
  const { register, handleSubmit, watch, control, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: instructor?.name || '',
      email: instructor?.email || '',
      designation: getInitialDesignation(instructor?.designation),
      customDesignation: getInitialCustom(instructor?.designation),
    },
  });

  const selectedDesignation = watch('designation');

  useEffect(() => {
    if (instructor) {
      reset({
        name: instructor.name,
        email: instructor.email,
        designation: getInitialDesignation(instructor.designation),
        customDesignation: getInitialCustom(instructor.designation),
      });
    } else {
      reset({ name: '', email: '', designation: 'Instructor', customDesignation: '' });
    }
  }, [instructor, reset]);

  const handleFormSubmit = (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    
    let finalDesignation = data.designation || 'Instructor';
    if (data.designation === 'Other') {
      finalDesignation = data.customDesignation || 'Instructor';
    }
    formData.append('designation', finalDesignation);
    
    onSubmit(formData);
  };

  const inputClasses = "w-full min-h-[44px] px-4 py-2 outline-none text-slate-800 font-normal bg-slate-50 border border-slate-200 shadow-sm rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 transition-colors placeholder:text-slate-400";
  const labelClasses = "text-sm font-semibold text-slate-700 px-1 mb-1 inline-block";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-8 bg-white shadow-2xl rounded-[32px] border border-slate-100">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold text-slate-800 tracking-tight">
            {instructor ? 'Edit Contributor' : 'Add New Contributor'}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500 mt-1">
            {instructor ? "Update the contributor's details below." : 'Fill out the form below to add a new contributor to your team.'}
          </DialogDescription>
        </DialogHeader>

        <form id="glass-instructor-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className={labelClasses}>
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              {...register('name')}
              className={`${inputClasses} ${errors.name ? "border-rose-400 ring-2 ring-rose-200" : ""}`}
            />
            {errors.name && <p className="text-xs font-medium text-rose-500 px-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className={labelClasses}>
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              placeholder="rahul@example.com"
              {...register('email')}
              className={`${inputClasses} ${errors.email ? "border-rose-400 ring-2 ring-rose-200" : ""}`}
            />
            {errors.email && <p className="text-xs font-medium text-rose-500 px-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className={labelClasses}>Designation</label>
            <Controller
              name="designation"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={[
                    { label: 'Instructor', value: 'Instructor' },
                    { label: 'Creator', value: 'Creator' },
                    { label: 'Other', value: 'Other' },
                  ]}
                  placeholder="Select designation..."
                  className="w-full h-[44px]"
                />
              )}
            />
            {errors.designation && <p className="text-xs font-medium text-rose-500 px-1">{errors.designation.message}</p>}
          </div>

          {selectedDesignation === 'Other' && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className={labelClasses}>
                Specify Designation <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Video Editor"
                {...register('customDesignation')}
                className={`${inputClasses} ${errors.customDesignation ? "border-rose-400 ring-2 ring-rose-200" : ""}`}
              />
              {errors.customDesignation && <p className="text-xs font-medium text-rose-500 px-1">{errors.customDesignation.message}</p>}
            </div>
          )}
        </form>

        <div className="mt-8 pt-4 flex sm:justify-end gap-3 items-center border-t border-slate-100">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={isLoading}
            className="text-slate-600 font-medium hover:text-slate-800 hover:bg-slate-100/50 rounded-full h-11 px-6"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="glass-instructor-form" 
            disabled={isLoading}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-full h-11 px-8 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            {isLoading ? 'Processing...' : (instructor ? 'Save Changes' : 'Create')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstructorForm;
