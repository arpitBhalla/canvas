import Papa from 'papaparse'
import type { DataSource } from '../types'

export function parseCSV(file: File): Promise<DataSource> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        if (!results.data.length) {
          reject(new Error('CSV file is empty'))
          return
        }
        resolve({
          type: 'csv',
          records: results.data,
          headers: results.meta.fields ?? [],
          fileName: file.name,
        })
      },
      error(err: Error) {
        reject(err)
      },
    })
  })
}

export function parseJSON(text: string): DataSource {
  const parsed: unknown = JSON.parse(text)
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('JSON must be a non-empty array of objects')
  }
  const records = parsed as Record<string, string>[]
  const headers = Object.keys(records[0]!)
  return { type: 'json', records, headers }
}
