export type TabData = {
  tuningTab: string;
  /**
   * Map key is the index of the bar tab to which this time signature applies.
   */
  timeSignatureTabsLookup: Map<number, string>;
  barTabs: Array<string>;
};
