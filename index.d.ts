declare module '@mapbox/mapbox-sdk' {
  // Base types
  export type Coordinates = [number, number];
  
  export interface MapiRequest {
    send(): Promise<MapiResponse>;
  }
  
  export interface MapiResponse {
    body: any;
    headers: Record<string, string>;
    statusCode: number;
  }

  // Map Matching types
  export interface MapMatchingPoint {
    coordinates: Coordinates;
    approach?: 'unrestricted' | 'curb';
    radius?: number;
    isWaypoint?: boolean;
    waypointName?: string;
    timestamp?: string | number | Date;
  }

  export interface MapMatchingRequest {
    points: MapMatchingPoint[] | string; // Array of points or OpenLR encoded string
    profile?: 'driving-traffic' | 'driving' | 'walking' | 'cycling' | 'mapbox/driving-traffic' | 'mapbox/driving' | 'mapbox/walking' | 'mapbox/cycling';
    annotations?: Array<'duration' | 'distance' | 'speed' | 'congestion' | 'congestion_numeric' | 'maxspeed'>;
    geometries?: 'geojson' | 'polyline' | 'polyline6';
    language?: string;
    overview?: 'simplified' | 'full' | 'false';
    steps?: boolean;
    tidy?: boolean;
    openLR_spec?: 'tomtom' | 'here';
    openLR_format?: 'xml' | 'binary';
  }

  // Directions types
  export interface DirectionsWaypoint {
    coordinates: Coordinates;
    approach?: 'unrestricted' | 'curb';
    bearing?: [number, number];
    radius?: number | 'unlimited';
    waypointName?: string;
  }

  export interface DirectionsRequest {
    profile?: 'driving-traffic' | 'driving' | 'walking' | 'cycling' | 'mapbox/driving-traffic' | 'mapbox/driving' | 'mapbox/walking' | 'mapbox/cycling';
    waypoints: DirectionsWaypoint[];
    alternatives?: boolean;
    annotations?: Array<'duration' | 'distance' | 'speed' | 'congestion' | 'congestion_numeric' | 'maxspeed' | 'closure' | 'state_of_charge'>;
    bannerInstructions?: boolean;
    continueStraight?: boolean;
    exclude?: string;
    geometries?: 'geojson' | 'polyline' | 'polyline6';
    language?: string;
    overview?: 'simplified' | 'full' | 'false';
    roundaboutExits?: boolean;
    steps?: boolean;
    voiceInstructions?: boolean;
    voiceUnits?: 'imperial' | 'metric';
    engine?: 'electric_no_recharge' | 'electric';
    ev_initial_charge?: number;
    ev_max_charge?: number;
    ev_connector_types?: 'ccs_combo_type1' | 'ccs_combo_type2' | 'tesla';
    energy_consumption_curve?: string;
    ev_charging_curve?: string;
    ev_unconditioned_charging_curve?: string;
    ev_pre_conditioning_time?: number;
    ev_max_ac_charging_power?: number;
    ev_min_charge_at_destination?: number;
    ev_min_charge_at_charging_station?: number;
    auxiliary_consumption?: number;
    maxHeight?: number;
    maxWidth?: number;
    maxWeight?: number;
    notifications?: string;
    departAt?: string;
    arriveBy?: string;
  }

  // Service interfaces
  export interface MapMatchingService {
    getMatch(config: MapMatchingRequest): MapiRequest;
  }

  export interface DirectionsService {
    getDirections(config: DirectionsRequest): MapiRequest;
  }

  // Client configuration
  export interface ClientConfig {
    accessToken: string;
    origin?: string;
  }

  // Main client interface
  export interface MapboxClient {
    mapMatching: MapMatchingService;
    directions: DirectionsService;
  }

  // Factory function
  export default function mapboxSdk(config: ClientConfig): MapboxClient;
  
  // Named export for CommonJS compatibility
  export function mapboxSdk(config: ClientConfig): MapboxClient;
}