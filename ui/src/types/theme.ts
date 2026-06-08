export interface Theme {
  name: string;
  color1: string; // primary golden amber
  color2: string; // lighter amber
  color3: string; // white
  label: string;
  panelDark: string;  // very dark bg
  panelMid: string;   // borders / hover
  panelLight: string; // labels / body text
  textMuted: string;  // de-saturated
}

export const THEME: Theme = {
  name: 'golden',
  label: 'AU',
  color1: '#D4A017',  // golden amber
  color2: '#F0C75E',  // light gold
  color3: '#FFFFFF',
  panelDark: '#0A0A0F',   // near black
  panelMid: '#2A2010',    // dark amber border
  panelLight: '#E8C766',  // light amber text
  textMuted: '#8B7340',   // muted gold
};
