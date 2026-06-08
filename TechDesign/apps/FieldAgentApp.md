# Field Agent Application Design

## Application Overview

The Field Agent Application is a mobile-first Progressive Web App (PWA) designed for recovery agents, field collectors, and site agents who work outside the office. It supports offline mode and GPS integration.

## Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | React Native (or PWA) |
| State Management | Redux Toolkit |
| Offline Storage | Redux Persist + LocalForage |
| GPS | Geolocation API |
| Camera | HTML5 Camera API |
| Background Sync | Service Worker |

## Mobile-First Design

### Viewport Configuration
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

### Touch-Friendly UI
```css
/* Large touch targets */
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}

/* Thumb-friendly navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 60px;
}
```

## Core Features

### Feature 1: Customer Visit Planner

#### Map Integration
```typescript
interface CustomerMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'visited' | 'completed';
}

const MapView = () => {
  const [markers, setMarkers] = useState<CustomerMarker[]>([]);
  const [currentLocation, setCurrentLocation] = useState<GeolocationCoordinates | null>(null);
  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setCurrentLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    });
  }, []);
  
  const calculateRoute = (destination: CustomerMarker) => {
    // Integrate with Google Maps or OpenStreetMap
  };
};
```

#### Visit Scheduling
```typescript
interface VisitSchedule {
  customerId: string;
  date: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  notes: string;
  priority: number;
}

const ScheduleCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [visits, setVisits] = useState<VisitSchedule[]>([]);
};
```

### Feature 2: Collection Tracker

#### Payment Recording
```typescript
interface PaymentRecord {
  id: string;
  collectionId: string;
  amount: number;
  method: 'cash' | 'bank' | 'upi' | 'cheque';
  referenceNumber?: string;
  receivedAt: string;
  capturedPhotos: string[];
  signature: string;
  notes: string;
}

const PaymentForm = () => {
  const [payment, setPayment] = useState<PaymentRecord>({
    id: uuid(),
    collectionId: '',
    amount: 0,
    method: 'cash',
    receivedAt: new Date().toISOString(),
    capturedPhotos: [],
    signature: '',
    notes: ''
  });
};
```

#### Photo Documentation
```typescript
const PhotoCapture = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const capturePhoto = () => {
    fileInputRef.current?.click();
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Compress and upload
      compressImage(file).then(compressed => {
        uploadPhoto(compressed);
      });
    }
  };
};
```

### Feature 3: Status Updates

#### Real-time Sync
```typescript
const useSyncQueue = () => {
  const [queue, setQueue] = useState<OfflineAction[]>([]);
  
  const addToQueue = (action: OfflineAction) => {
    setQueue(prev => [...prev, action]);
  };
  
  const processQueue = async () => {
    for (const action of queue) {
      try {
        await api.processAction(action);
        removeFromQueue(action.id);
      } catch (error) {
        // Retry logic
      }
    }
  };
};
```

## Offline Capabilities

### Service Worker Setup
```typescript
// public/sw.js
const CACHE_NAME = 'field-agent-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});
```

### Local Storage Strategy
```typescript
// Offline data management
const offlineStorage = {
  customers: new LocalForage({ name: 'customers' }),
  visits: new LocalForage({ name: 'visits' }),
  payments: new LocalForage({ name: 'payments' }),
  
  save: async (store, data) => {
    await offlineStorage[store].setItem(data.id, data);
  },
  
  load: async (store) => {
    return await offlineStorage[store].getAll();
  },
  
  sync: async () => {
    // Sync all offline data when online
  }
};
```

## GPS Integration

### Location Services
```typescript
interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  
  const startWatching = () => {
    const id = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        });
      },
      console.error,
      { 
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
      }
    );
    setWatchId(id);
  };
  
  return { location, startWatching };
};
```

## Low Bandwidth Optimizations

### Data Compression
```typescript
const compressPayload = (data: any) => {
  const json = JSON.stringify(data);
  // Use gzip or similar for large payloads
  return json.length > 1024 ? compress(json) : json;
};
```

### Progressive Loading
```typescript
const LoadMoreList = ({ fetchMore, hasMore }) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  
  const loadMore = useCallback(async () => {
    if (hasMore) {
      const newData = await fetchMore(page);
      setData(prev => [...prev, ...newData]);
      setPage(prev => prev + 1);
    }
  }, [page, hasMore]);
};
```

## UI Components

### Mobile Screens Layout

```
Screen: Dashboard
┌─────────────────┐
│ Header          │
├─────────────────┤
│ Quick Stats     │
│ ┌─────┬─────┐   │
│ │Today│Week │   │
│ └─────┴─────┘   │
├─────────────────┤
│ Scheduled Visits│
│ [List]          │
├─────────────────┤
│ Quick Actions   │
│ [Buttons]       │
└─────────────────┘

Screen: Customer Detail
┌─────────────────┐
│ ← Customer Name │
├─────────────────┤
│ Customer Info   │
│ [Avatar]        │
│ Name, Phone     │
├─────────────────┤
│ Loan Summary    │
│ Amount, EMI     │
├─────────────────┤
│ Actions         │
│ [Call] [Visit]  │
│ [Message]       │
└─────────────────┘

Screen: Collection
┌─────────────────┐
│ ← Collect       │
├─────────────────┤
│ Amount: ₹_____  │
│ Method: [▼]     │
│ [Cash|UPI|Bank] │
├─────────────────┤
│ Photo           │
│ [📷 Capture]    │
├─────────────────┤
│ Notes           │
│ [_________]     │
├─────────────────┤
│ [Submit]        │
└─────────────────┘
```

## Integration Points

### API Integration
```typescript
const fieldAgentApi = {
  getScheduledVisits: () => api.get('/collections/scheduled'),
  recordPayment: (data: PaymentRecord) => api.post('/collections/payment', data),
  updateLocation: (location: LocationData) => api.put('/agents/location', { location }),
  getCustomer: (id: string) => api.get(`/customers/${id}`)
};
```

### Background Sync
```typescript
const backgroundSync = {
  register: async () => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-collections');
    }
  },
  
  process: async () => {
    const pendingPayments = await offlineStorage.payments.loadAll();
    for (const payment of pendingPayments) {
      await api.recordPayment(payment);
    }
  }
};
```

## Performance Requirements

### Mobile Metrics
| Metric | Target |
|--------|--------|
| First Paint | < 2s |
| Time to Interactive | < 5s |
| Offline Support | 80% features |
| Bundle Size | < 300KB |

### Battery Optimization
- Minimize GPS usage
- Batch API calls
- Reduce background processing
- Optimize image compression

## Testing for Mobile

### Device Testing
- iOS Safari
- Android Chrome
- Various screen sizes
- Offline scenarios

### Network Simulation
```typescript
// Test with various network conditions
const networkConditions = {
  offline: { latency: 0, throughput: 0 },
  slow2g: { latency: 2000, throughput: 50 * 1024 },
  slow3g: { latency: 1500, throughput: 100 * 1024 },
  3g: { latency: 100, throughput: 500 * 1024 },
  4g: { latency: 20, throughput: 1.5 * 1024 * 1024 }
};
```

## Deployment Considerations

### PWA Manifest
```json
{
  "name": "NBFC Field Agent",
  "short_name": "FieldAgent",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0066cc",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### Installation Prompt
```typescript
const beforeinstallprompt = (e: Event) => {
  e.preventDefault();
  // Show custom install button
  showInstallPrompt();
};
```