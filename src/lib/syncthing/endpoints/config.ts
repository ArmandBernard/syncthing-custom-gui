import type {
  Configuration,
  DeviceConfiguration,
  FolderConfiguration,
  GUIConfiguration,
  Ignores,
  LDAPConfiguration,
  OptionsConfiguration,
} from '../types/config'

// PUT vs PATCH semantics differ (confirmed from Syncthing's Go source, not just
// docs): PATCH .../folders/:id and .../devices/:id shallow-merge onto the
// *current live* value (Partial<T> is accurate). But PUT to an existing
// folder/device, and PUT/PATCH options|gui|ldap, rebuild from the *defaults
// template* — an omitted field on PUT silently resets to default, not
// "unchanged". Keep this in mind before wiring up any config-editing UI.

export interface ConfigEndpoints {
  'GET /config': { response: Configuration }
  'PUT /config': { body: Configuration; response: void }

  'GET /config/restart-required': { response: { requiresRestart: boolean } }

  'GET /config/folders': { response: FolderConfiguration[] }
  'PUT /config/folders': { body: FolderConfiguration[]; response: void }
  'POST /config/folders': { body: FolderConfiguration; response: void }

  'GET /config/folders/:id': { params: { id: string }; response: FolderConfiguration }
  'PUT /config/folders/:id': { params: { id: string }; body: FolderConfiguration; response: void }
  'PATCH /config/folders/:id': {
    params: { id: string }
    body: Partial<FolderConfiguration>
    response: void
  }
  'DELETE /config/folders/:id': { params: { id: string }; response: void }

  'GET /config/devices': { response: DeviceConfiguration[] }
  'PUT /config/devices': { body: DeviceConfiguration[]; response: void }
  'POST /config/devices': { body: DeviceConfiguration; response: void }

  'GET /config/devices/:id': { params: { id: string }; response: DeviceConfiguration }
  'PUT /config/devices/:id': { params: { id: string }; body: DeviceConfiguration; response: void }
  'PATCH /config/devices/:id': {
    params: { id: string }
    body: Partial<DeviceConfiguration>
    response: void
  }
  'DELETE /config/devices/:id': { params: { id: string }; response: void }

  'GET /config/options': { response: OptionsConfiguration }
  'PUT /config/options': { body: OptionsConfiguration; response: void }
  'PATCH /config/options': { body: Partial<OptionsConfiguration>; response: void }

  'GET /config/gui': { response: GUIConfiguration }
  'PUT /config/gui': { body: GUIConfiguration; response: void }
  'PATCH /config/gui': { body: Partial<GUIConfiguration>; response: void }

  'GET /config/ldap': { response: LDAPConfiguration }
  'PUT /config/ldap': { body: LDAPConfiguration; response: void }
  'PATCH /config/ldap': { body: Partial<LDAPConfiguration>; response: void }

  'GET /config/defaults/folder': { response: FolderConfiguration }
  'PUT /config/defaults/folder': { body: FolderConfiguration; response: void }
  'PATCH /config/defaults/folder': { body: Partial<FolderConfiguration>; response: void }

  'GET /config/defaults/device': { response: DeviceConfiguration }
  'PUT /config/defaults/device': { body: DeviceConfiguration; response: void }
  'PATCH /config/defaults/device': { body: Partial<DeviceConfiguration>; response: void }

  'GET /config/defaults/ignores': { response: Ignores }
  'PUT /config/defaults/ignores': { body: Ignores; response: void }

  // --- Deprecated aliases (still functional; kept for legacy callers) ---
  /** @deprecated since v1.12.0 — use 'GET /config' */
  'GET /system/config': { response: Configuration }
  /** @deprecated since v1.12.0 — use 'PUT /config' (method is POST, not PUT, on this legacy path) */
  'POST /system/config': { body: Configuration; response: void }
  /** @deprecated since v1.12.0 — use 'GET /config/restart-required' */
  'GET /system/config/insync': { response: { configInSync: boolean } }
}
