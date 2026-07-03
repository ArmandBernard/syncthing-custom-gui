import type { EventEnvelope } from './envelope'
import type {
  ClusterConfigReceivedData,
  ConfigSavedData,
  DeviceConnectedData,
  DeviceDisconnectedData,
  DeviceDiscoveredData,
  DevicePausedData,
  DeviceRejectedData,
  DeviceResumedData,
  DownloadProgressData,
  FailureData,
  FolderCompletionData,
  FolderErrorsData,
  FolderPausedData,
  FolderRejectedData,
  FolderResumedData,
  FolderScanProgressData,
  FolderSummaryData,
  FolderWatchStateChangedData,
  ItemFinishedData,
  ItemStartedData,
  ListenAddressesChangedData,
  LocalChangeDetectedData,
  LocalIndexUpdatedData,
  LoginAttemptData,
  PendingDevicesChangedData,
  PendingFoldersChangedData,
  RemoteChangeDetectedData,
  RemoteDownloadProgressData,
  RemoteIndexUpdatedData,
  StartingData,
  StartupCompleteData,
  StateChangedData,
} from './payloads'

export type ClusterConfigReceivedEvent = EventEnvelope<
  'ClusterConfigReceived',
  ClusterConfigReceivedData
>
export type ConfigSavedEvent = EventEnvelope<'ConfigSaved', ConfigSavedData>
export type DeviceConnectedEvent = EventEnvelope<'DeviceConnected', DeviceConnectedData>
export type DeviceDisconnectedEvent = EventEnvelope<'DeviceDisconnected', DeviceDisconnectedData>
export type DeviceDiscoveredEvent = EventEnvelope<'DeviceDiscovered', DeviceDiscoveredData>
export type DevicePausedEvent = EventEnvelope<'DevicePaused', DevicePausedData>
export type DeviceRejectedEvent = EventEnvelope<'DeviceRejected', DeviceRejectedData>
export type DeviceResumedEvent = EventEnvelope<'DeviceResumed', DeviceResumedData>
export type DownloadProgressEvent = EventEnvelope<'DownloadProgress', DownloadProgressData>
export type FailureEvent = EventEnvelope<'Failure', FailureData>
export type FolderCompletionEvent = EventEnvelope<'FolderCompletion', FolderCompletionData>
export type FolderErrorsEvent = EventEnvelope<'FolderErrors', FolderErrorsData>
export type FolderPausedEvent = EventEnvelope<'FolderPaused', FolderPausedData>
export type FolderRejectedEvent = EventEnvelope<'FolderRejected', FolderRejectedData>
export type FolderResumedEvent = EventEnvelope<'FolderResumed', FolderResumedData>
export type FolderScanProgressEvent = EventEnvelope<'FolderScanProgress', FolderScanProgressData>
export type FolderSummaryEvent = EventEnvelope<'FolderSummary', FolderSummaryData>
export type FolderWatchStateChangedEvent = EventEnvelope<
  'FolderWatchStateChanged',
  FolderWatchStateChangedData
>
export type ItemFinishedEvent = EventEnvelope<'ItemFinished', ItemFinishedData>
export type ItemStartedEvent = EventEnvelope<'ItemStarted', ItemStartedData>
export type ListenAddressesChangedEvent = EventEnvelope<
  'ListenAddressesChanged',
  ListenAddressesChangedData
>
export type LocalChangeDetectedEvent = EventEnvelope<'LocalChangeDetected', LocalChangeDetectedData>
export type LocalIndexUpdatedEvent = EventEnvelope<'LocalIndexUpdated', LocalIndexUpdatedData>
export type LoginAttemptEvent = EventEnvelope<'LoginAttempt', LoginAttemptData>
export type PendingDevicesChangedEvent = EventEnvelope<
  'PendingDevicesChanged',
  PendingDevicesChangedData
>
export type PendingFoldersChangedEvent = EventEnvelope<
  'PendingFoldersChanged',
  PendingFoldersChangedData
>
export type RemoteChangeDetectedEvent = EventEnvelope<
  'RemoteChangeDetected',
  RemoteChangeDetectedData
>
export type RemoteDownloadProgressEvent = EventEnvelope<
  'RemoteDownloadProgress',
  RemoteDownloadProgressData
>
export type RemoteIndexUpdatedEvent = EventEnvelope<'RemoteIndexUpdated', RemoteIndexUpdatedData>
export type StartingEvent = EventEnvelope<'Starting', StartingData>
export type StartupCompleteEvent = EventEnvelope<'StartupComplete', StartupCompleteData>
export type StateChangedEvent = EventEnvelope<'StateChanged', StateChangedData>

export type SyncthingEvent =
  | ClusterConfigReceivedEvent
  | ConfigSavedEvent
  | DeviceConnectedEvent
  | DeviceDisconnectedEvent
  | DeviceDiscoveredEvent
  | DevicePausedEvent
  | DeviceRejectedEvent
  | DeviceResumedEvent
  | DownloadProgressEvent
  | FailureEvent
  | FolderCompletionEvent
  | FolderErrorsEvent
  | FolderPausedEvent
  | FolderRejectedEvent
  | FolderResumedEvent
  | FolderScanProgressEvent
  | FolderSummaryEvent
  | FolderWatchStateChangedEvent
  | ItemFinishedEvent
  | ItemStartedEvent
  | ListenAddressesChangedEvent
  | LocalChangeDetectedEvent
  | LocalIndexUpdatedEvent
  | LoginAttemptEvent
  | PendingDevicesChangedEvent
  | PendingFoldersChangedEvent
  | RemoteChangeDetectedEvent
  | RemoteDownloadProgressEvent
  | RemoteIndexUpdatedEvent
  | StartingEvent
  | StartupCompleteEvent
  | StateChangedEvent
