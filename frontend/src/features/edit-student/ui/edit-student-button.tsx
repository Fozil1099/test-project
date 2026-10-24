import { useState } from 'react';
import { StudentForm, type Student } from '@/entities/student';
import { Button, Sheet, useToast } from '@/shared/ui';
import { useUpdateStudent } from '../model/use-update-student';

export function EditStudentButton({ student }: { student: Student }) {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const updateStudent = useUpdateStudent(student.id);

  return (
    <>
      <Button
        variant="secondary"
        block
        onClick={() => setOpen(true)}
        data-testid="edit-student-open"
      >
        Изменить
      </Button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Редактировать ученика"
        testId="edit-student-sheet"
      >
        <StudentForm
          defaultValues={student}
          submitLabel="Сохранить"
          submitting={updateStudent.isPending}
          onSubmit={(values) =>
            updateStudent.mutate(values, {
              onSuccess: () => {
                toast.success('Изменения сохранены');
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
