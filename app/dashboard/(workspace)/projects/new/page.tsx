import { NewProjectWizard } from "@/components/dashboard/new-project-wizard";
import { requireUser } from "@/lib/supabase/auth";
import { getProjectOverview } from "@/lib/services/projects/queries";

export default async function NewProjectPage({
  searchParams
}: {
  searchParams: Promise<{ step?: string; projectId?: string }>;
}) {
  const { user } = await requireUser();
  const params = await searchParams;
  const step = Number(params.step || "1");

  if (!params.projectId) {
    return <NewProjectWizard initialStep={1} project={null} initialUploads={[]} />;
  }

  const { project, uploads } = await getProjectOverview(params.projectId, user.id);

  return <NewProjectWizard initialStep={step} project={project} initialUploads={uploads} />;
}
