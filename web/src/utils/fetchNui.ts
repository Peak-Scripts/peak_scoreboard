import { isEnvBrowser } from "./misc";

// Mock data for development
const mockTrackedJobs = {
  "police": {
    label: "Police",
    icon: "👮",
    color: "#3b82f6"
  },
  "ambulance": {
    label: "EMS",
    icon: "🚑",
    color: "#ef4444"
  },
  "mechanic": {
    label: "Mechanic",
    icon: "🔧",
    color: "#f59e0b"
  }
};

const mockData = {
  players: [
    { id: 1, name: "John Doe", ping: 45, job: "Police" },
    { id: 2, name: "Jane Smith", ping: 32, job: "EMS" },
    { id: 3, name: "Bob Johnson", ping: 58, job: "Mechanic" },
    { id: 4, name: "Alice Brown", ping: 120, job: "Civilian" },
  ],
  serverInfo: {
    name: "Development Server",
    logo: "https://i.imgur.com/example.png",
    maxPlayers: 48,
    jobCounts: {
      police: 2,
      ambulance: 1,
      mechanic: 1
    },
    trackedJobs: mockTrackedJobs
  }
};

/**
 * Simple wrapper around fetch API tailored for CEF/NUI use.
 * @param eventName - The endpoint eventname to target
 * @param data - Data you wish to send in the NUI Callback
 */
export async function fetchNui<T = any>(
  eventName: string,
  data: unknown = {}
): Promise<T> {
  if (isEnvBrowser()) {
    // If we're in browser dev mode, return mock data
    switch (eventName) {
      case "getData":
      case "updateData":
        return mockData as T;
      default:
        return {} as T;
    }
  }

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(data),
  };

  const resourceName = (window as any).GetParentResourceName
    ? (window as any).GetParentResourceName()
    : "peak_scoreboard";

  const resp = await fetch(`https://${resourceName}/${eventName}`, options);
  return await resp.json();
}
