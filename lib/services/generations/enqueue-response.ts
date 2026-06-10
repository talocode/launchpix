export type AcceptedGenerationResponse = {
  generationId: string;
  status: "queued";
  poll: string;
};

export function buildAcceptedGenerationResponse(projectId: string, generationId: string): AcceptedGenerationResponse {
  return {
    generationId,
    status: "queued",
    poll: `/api/v1/projects/${projectId}/generations/${generationId}`
  };
}