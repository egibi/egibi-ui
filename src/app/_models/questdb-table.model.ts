export class QuestDbTable {
  tableName: string;
  tableColumns: QuestDbTableColumn[];
  tablePartitionBy: QuestDbPartitionBy;
}

export class QuestDbTableColumn {
  columnName: string;
  dataType: string;
}

export enum QuestDbPartitionBy {
  /**
   *No partitioning. All data is stored in a single directory.
   *
   *Small dataset, fast access needed*/

  none = "NONE",
  /**
   *Partitions the data by calendar day (yyyy-MM-dd).
   *
   *Medium to large dataset (daily queries)*/
  day = "DAY",
  /**
   *Partitions the data by calendar month (yyyy-MM).
   *
   *Long-term historical data (monthly use)*/
  month = "MONTH",
  /**
   *Partitions the data by calendar year (yyyy).
   *
   *Large archive datasets*/
  year = "YEAR",
}

export enum QuestDbDataType {
  /**true / false values*/
  boolean = "BOOLEAN",
  /**8-bit signed integer*/
  byte = "BYTE",
  /**16-bit signed integer*/
  short = "SHORT",
  /**32-bit signed integer*/
  int = "INT",
  /**64-bit signed integer*/
  long = "LONG",
  /**32-bit floating point*/
  float = "FLOAT",
  /**64-bit floating point */
  double = "DOUBLE",
  /**Date and time as microseconds since epoch (UTC)*/
  date = "DATE",
  /**High-performance timestamp (microseconds since epoch)*/
  timestamp = "TIMESTAMP",
  /**Interned string (optimized for low cardinality and filtering)*/
  symbol = "SYMBOL",
  /**Standard variable-length string*/
  string = "STRING",
  /**256-bit integer (rare use cases, e.g., crypto hashes)*/
  long_256 = "LONG256",
  /**Geospatial types (point location data)*/
  geo_byte = "GEOBYTE",
  /**Geospatial types (point location data)*/
  geo_short = "GEOSHORT",
  /**Geospatial types (point location data)*/
  geo_int = "GEOINT",
  /**Geospatial types (point location data)*/
  geo_long = "GEOLONG",
  /**Arbitrary binary data (not commonly used)*/
  binary = "BINARY",
}
