import { CreateStudentButton } from '@/features/create-student';
import { PageHeader } from '@/widgets/page-header';
import { StudentsList } from '@/widgets/students-list';

export function StudentsPage() {
  return (
    <>
      <PageHeader title="Ученики" actions={<CreateStudentButton />} />
      <main className="mx-auto max-w-xl px-4 py-4">
        <StudentsList />
      </main>
    </>
  );
}
