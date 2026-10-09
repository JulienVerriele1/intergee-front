const GENERIC_MESSAGES = {
  401: 'Votre session a expiré. Veuillez vous reconnecter.',
  403: "Vous n'avez pas les droits nécessaires pour cette action.",
  404: "La ressource demandée n'existe pas.",
  500: 'Une erreur est survenue sur le serveur. Réessayez plus tard.',
}

/**
 * Normalized API error. The backend answers RFC 9457 problem details: { status, detail, code? }.
 * `code` tells apart business errors sharing a status (e.g. MISSION_FULL, ALREADY_APPLIED).
 */
export class ApiError extends Error {
  constructor(status, message, code = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }

  get isNetworkError() {
    return this.status === 0
  }
}

export function toApiError(error) {
  if (error instanceof ApiError) {
    return error
  }
  const response = error?.response
  if (!response) {
    return new ApiError(0, 'Le serveur est injoignable. Vérifiez votre connexion.')
  }
  const { status, data } = response
  // Validation (400) and conflict (409) details are meaningful to the user; others get a generic message
  const detail = [400, 409].includes(status) && typeof data?.detail === 'string' ? data.detail : null
  const code = typeof data?.code === 'string' ? data.code : null
  return new ApiError(status, detail ?? GENERIC_MESSAGES[status] ?? GENERIC_MESSAGES[500], code)
}
