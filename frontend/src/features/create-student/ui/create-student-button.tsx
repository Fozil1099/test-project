import { useState } from 'react';
import { StudentForm } from '@/entities/student';
import { Button, Sheet, useToast } from '@/shared/ui';
import { useCreateStudent } from '../model/use-create-student';

export function CreateStudentButton() {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const createStudent = useCreateStudent();

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} data-testid="create-student-open">
        + Добавить
      </Button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Новый ученик"
        testId="create-student-sheet"
      >
        <StudentForm
          submitLabel="Добавить ученика"
          submitting={createStudent.isPending}
          onSubmit={(values) =>
            createStudent.mutate(values, {
              onSuccess: (s) => {
                toast.success(`Ученик ${s.name} добавлен`);
                setOpen(false);
              },
              onError: (e) => toast.error(e.message),
            })
          }
        />
      </Sheet>
    </>
  );
}
