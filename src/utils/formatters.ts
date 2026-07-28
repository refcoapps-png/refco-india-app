// Format Date ISO or yyyy-mm-dd to DD-MMM-YYYY (e.g., "2026-07-28" -> "28-Jul-2026")
export function formatDateDDMMMYYYY(dateInput?: string | Date): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
}

// Convert DD-MMM-YYYY or ISO or Date to YYYY-MM-DD for native <input type="date">
export function toInputDateValue(dateStr?: string | Date): string {
  if (!dateStr) return '';
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  if (typeof dateStr === 'string') {
    // Parse DD-MMM-YYYY
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parts[0];
      const monthStr = parts[1];
      const year = parts[2];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = months.findIndex(m => m.toLowerCase() === monthStr.toLowerCase());
      if (monthIdx >= 0) {
        const monthNum = String(monthIdx + 1).padStart(2, '0');
        return `${year}-${monthNum}-${String(day).padStart(2, '0')}`;
      }
    }
  }

  return '';
}

// Image File to Base64 data URL
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
