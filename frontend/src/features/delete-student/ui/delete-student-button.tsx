import { useState } from 'react';
import type { Student } from '@/entities/student';
import { Button, Sheet, useToast } from '@/shared/ui';
import { useDeleteStudent } from '../model/use-delete-student';

interface DeleteStudentButtonProps {
  student: Student;
  onDeleted?: () => void;
}

export function DeleteStudentButton({ student, onDeleted }: DeleteStudentButtonProps) {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const deleteStudent = useDeleteStudent(student.id);

  return (
    <>
      <Button
        variant="ghost"
        block
        className="text-rose-600"
        onClick={() => setOpen(true)}
        data-testid="delete-student-open"
      >
        Удалить
      </Button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Удалить ученика?"
        testId="delete-student-sheet"
      >
        <p className="text-slate-600">
          {student.name} и вся история его оплат будут удалены без возможности восстановления.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Button
            variant="danger"
            block
            loading={deleteStudent.isPending}
            data-testid="delete-student-confirm"
            onClick={() =>
              deleteStudent.mutate(undefined, {
                onSuccess: () => {
                  toast.success(`Ученик ${student.name} удалён`);
                  setOpen(false);
                  onDeleted?.();
                },
                onError: (e) => toast.error(e.message),
              })
            }
          >
            Удалить
          </Button>
          <Button variant="secondary" block onClick={() => setOpen(false)}>
            Отмена
          </Button>
        </div>
      </Sheet>
    </>
  );
}
