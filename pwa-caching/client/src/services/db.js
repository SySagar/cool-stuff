import { openDB } from "idb";

const dbPromise = openDB("weather-db", 1, {
  upgrade(db) {
    db.createObjectStore("forecasts");
  },
});

export async function setForcast(city, data) {
  const db = await dbPromise;
  await db.put("forecasts", data, city);
}

export async function getForecast(city) {
  const db = await dbPromise;
  return db.get("forecasts", city);
}

export async function deleteAllForecasts() {
  const db = await dbPromise;
  const tx = db.transaction("forecasts", "readwrite");
  const store = tx.objectStore("forecasts");
  const keys = await store.getAllKeys();
  for (const key of keys) {
    await store.delete(key);
  }
  await tx.done;
}
