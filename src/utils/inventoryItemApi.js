/** Map UI location to inventory API payload. */
export function mapLocationToApi(location) {
  if (!location) return undefined;
  return {
    building: location.building ?? 0,
    storey: location.storey ?? 0,
    room: location.room ?? 0,
  };
}
