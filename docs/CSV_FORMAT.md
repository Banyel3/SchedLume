# SchedLume CSV Template Format

## Overview

SchedLume uses a standardized CSV format for importing and exporting class schedules. This ensures round-trip compatibility: schedules exported from the app can be re-imported without modification.

## Official Header Format

```csv
subject_name,day_of_week,start_time,end_time,location,professor,color
```

**Column Order**: The columns MUST appear in this exact order. The import parser expects these headers.

---

## Column Definitions

| Column         | Required | Format                       | Example                  |
| -------------- | -------- | ---------------------------- | ------------------------ |
| `subject_name` | **Yes**  | Any text                     | `Calculus I`             |
| `day_of_week`  | **Yes**  | Full name (case-insensitive) | `Monday`, `TUESDAY`      |
| `start_time`   | **Yes**  | HH:MM (24-hour)              | `09:00`, `14:30`         |
| `end_time`     | **Yes**  | HH:MM (24-hour)              | `10:30`, `16:00`         |
| `location`     | No       | Any text (or blank)          | `Room 204`, `Building A` |
| `professor`    | No       | Any text (or blank)          | `Dr. Smith`              |
| `color`        | No       | CSS hex code (or blank)      | `#FF6B6B`, `#4ECDC4`     |

---

## Field Requirements

### subject_name

- **Required**: Yes
- **Description**: The name of the class/subject
- **Validation**: Must not be empty
- **Notes**: Supports any characters including commas (when properly quoted)

### day_of_week

- **Required**: Yes
- **Description**: The day when the class occurs
- **Valid values**: `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, `Sunday`
- **Case**: Case-insensitive (`monday` = `Monday` = `MONDAY`)
- **Validation**: Must match one of the valid values

### start_time

- **Required**: Yes
- **Format**: 24-hour time as `HH:MM`
- **Examples**: `09:00`, `13:30`, `08:15`
- **Validation**: Must be valid time, must be before end_time
- **Notes**: Leading zeros optional for hours (`9:00` = `09:00`)

### end_time

- **Required**: Yes
- **Format**: 24-hour time as `HH:MM`
- **Examples**: `10:30`, `15:45`, `17:00`
- **Validation**: Must be valid time, must be after start_time

### location

- **Required**: No
- **Description**: Where the class takes place
- **Default**: Empty string if not provided
- **Notes**: Displays in the class card if present

### professor

- **Required**: No
- **Description**: Instructor name
- **Default**: Empty string if not provided
- **Notes**: Displays in the class card if present

### color

- **Required**: No
- **Format**: CSS hex color (`#RRGGBB`)
- **Examples**: `#FF6B6B`, `#4ECDC4`, `#45B7D1`
- **Default**: Auto-assigned based on subject name if not provided
- **Validation**: Must be valid 6-digit hex color code if provided

---

## Example Files

### Minimal (Required Fields Only)

```csv
subject_name,day_of_week,start_time,end_time,location,professor,color
Math 101,Monday,09:00,10:30,,,
English Literature,Tuesday,11:00,12:30,,,
Physics Lab,Wednesday,14:00,16:00,,,
```

### Full (All Fields)

```csv
subject_name,day_of_week,start_time,end_time,location,professor,color
Math 101,Monday,09:00,10:30,Room 204,Dr. Smith,#FF6B6B
Math 101,Wednesday,09:00,10:30,Room 204,Dr. Smith,#FF6B6B
English Literature,Tuesday,11:00,12:30,Hall B,Prof. Jones,#4ECDC4
Physics Lab,Wednesday,14:00,16:00,Science Building,Dr. Lee,#45B7D1
```

### With Special Characters

```csv
subject_name,day_of_week,start_time,end_time,location,professor,color
"Introduction to Programming, Part 1",Monday,09:00,11:00,Lab 101,,
"History: World War II",Thursday,13:00,14:30,"Room 305, Floor 3","Dr. O'Brien",#FFD93D
```

---

## CSV Formatting Rules

### RFC 4180 Compliance

The CSV format follows [RFC 4180](https://tools.ietf.org/html/rfc4180):

1. **Fields containing commas** must be enclosed in double quotes:

   ```
   "Introduction to Programming, Part 1"
   ```

2. **Fields containing double quotes** must be enclosed in double quotes, and each embedded quote must be escaped by doubling:

   ```
   "The ""Best"" Course" → The "Best" Course
   ```

3. **Fields containing newlines** must be enclosed in double quotes

4. **Empty fields** are allowed for optional columns:
   ```
   Math 101,Monday,09:00,10:30,,,
   ```

### Line Endings

- Windows (CRLF): `\r\n`
- Unix (LF): `\n`
- Both are accepted on import

### Character Encoding

- **UTF-8** is required
- BOM (Byte Order Mark) is optional but supported

---

## Validation Rules

When importing, the validator checks:

1. **Header row**: Must contain all required column names
2. **Required fields**: `subject_name`, `day_of_week`, `start_time`, `end_time` must have values
3. **Day of week**: Must be a valid day name
4. **Time format**: Must match HH:MM pattern
5. **Time order**: `start_time` must be before `end_time`
6. **Color format**: If provided, must be valid hex (`#RRGGBB`)

### Error Messages

| Error                | Message                                    |
| -------------------- | ------------------------------------------ |
| Missing header       | "Missing required column: [column_name]"   |
| Empty required field | "Row N: [field] is required"               |
| Invalid day          | "Row N: Invalid day_of_week '[value]'"     |
| Invalid time format  | "Row N: Invalid time format for [field]"   |
| End before start     | "Row N: end_time must be after start_time" |
| Invalid color        | "Row N: Invalid color format '[value]'"    |

---

## Export Formats

The app provides three export options:

### 1. Blank Template

- Contains only the header row
- For users creating schedules from scratch
- File name: `schedlume-template.csv`

### 2. Example Template

- Header row plus sample data rows
- Shows proper formatting for each field
- File name: `schedlume-example.csv`

### 3. Current Schedule

- Exports all classes currently saved in the app
- Preserves all data including colors
- File name: `schedlume-schedule-[timestamp].csv`
- Suitable for backup or transferring to another device

---

## Default Color Palette

When no color is specified, these colors are assigned cyclically:

```javascript
const DEFAULT_COLORS = [
  "#FF6B6B", // Coral red
  "#4ECDC4", // Teal
  "#45B7D1", // Sky blue
  "#96CEB4", // Sage green
  "#FFEAA7", // Warm yellow
  "#DDA0DD", // Plum
  "#98D8C8", // Mint
  "#F7DC6F", // Soft gold
  "#BB8FCE", // Lavender
  "#85C1E9", // Light blue
];
```

Color assignment is deterministic based on the subject name hash, ensuring the same subject always gets the same default color.

---

## Integration Notes

### For Developers

Import function location: `lib/csv/importer.ts`
Export function location: `lib/csv-template.ts`
Validation logic: `lib/csv/validator.ts`

### Storage

Imported schedules are stored in IndexedDB via the `scheduleStore` (Zustand + persist).

### Notes

User notes are NOT included in CSV export/import as they are stored separately per schedule entry and require the entry's ID for association.
