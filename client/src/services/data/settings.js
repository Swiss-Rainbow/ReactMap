export default async function () {
  try {
    const response = await fetch(`/settings`)
    if (!response.ok) {
      throw new Error(`${response.status} (${response.statusText})`)
    }
    const body = await response.json()
    return body.settings
  } catch (error) {
    console.error(error.message)
  }
}