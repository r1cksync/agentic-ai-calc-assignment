import * as math from 'mathjs';

const conversionFactors: Record<string, Record<string, { factor: number; offset?: number }>> = {
  // Length
  m: { km: { factor: 0.001 }, cm: { factor: 100 }, mm: { factor: 1000 }, mi: { factor: 0.000621371 }, ft: { factor: 3.28084 }, in: { factor: 39.3701 }, yd: { factor: 1.09361 }, nm: { factor: 1e9 }, um: { factor: 1e6 } },
  km: { m: { factor: 1000 }, cm: { factor: 100000 }, mi: { factor: 0.621371 }, ft: { factor: 3280.84 }, in: { factor: 39370.1 }, yd: { factor: 1093.61 } },
  cm: { m: { factor: 0.01 }, mm: { factor: 10 }, in: { factor: 0.393701 }, ft: { factor: 0.0328084 } },
  mm: { m: { factor: 0.001 }, cm: { factor: 0.1 }, in: { factor: 0.0393701 } },
  mi: { km: { factor: 1.60934 }, m: { factor: 1609.34 }, ft: { factor: 5280 }, yd: { factor: 1760 } },
  ft: { m: { factor: 0.3048 }, cm: { factor: 30.48 }, in: { factor: 12 }, yd: { factor: 0.333333 }, mi: { factor: 0.000189394 } },
  in: { cm: { factor: 2.54 }, mm: { factor: 25.4 }, ft: { factor: 0.0833333 }, m: { factor: 0.0254 } },
  yd: { m: { factor: 0.9144 }, ft: { factor: 3 }, mi: { factor: 0.000568182 } },

  // Mass
  kg: { g: { factor: 1000 }, mg: { factor: 1e6 }, lb: { factor: 2.20462 }, oz: { factor: 35.274 }, ton: { factor: 0.001 } },
  g: { kg: { factor: 0.001 }, mg: { factor: 1000 }, lb: { factor: 0.00220462 }, oz: { factor: 0.035274 } },
  mg: { g: { factor: 0.001 }, kg: { factor: 1e-6 } },
  lb: { kg: { factor: 0.453592 }, g: { factor: 453.592 }, oz: { factor: 16 }, ton: { factor: 0.000453592 } },
  oz: { g: { factor: 28.3495 }, kg: { factor: 0.0283495 }, lb: { factor: 0.0625 } },
  ton: { kg: { factor: 1000 }, lb: { factor: 2204.62 } },

  // Energy
  J: { kJ: { factor: 0.001 }, cal: { factor: 0.239006 }, kcal: { factor: 0.000239006 }, eV: { factor: 6.242e18 }, kWh: { factor: 2.7778e-7 }, BTU: { factor: 0.000947817 } },
  kJ: { J: { factor: 1000 }, cal: { factor: 239.006 }, kcal: { factor: 0.239006 }, eV: { factor: 6.242e21 } },
  cal: { J: { factor: 4.184 }, kJ: { factor: 0.004184 }, kcal: { factor: 0.001 }, eV: { factor: 2.611e19 } },
  kcal: { J: { factor: 4184 }, kJ: { factor: 4.184 }, cal: { factor: 1000 }, eV: { factor: 2.611e22 } },
  eV: { J: { factor: 1.602e-19 }, kJ: { factor: 1.602e-22 }, cal: { factor: 3.829e-20 }, kcal: { factor: 3.829e-23 } },

  // Angle
  deg: { rad: { factor: Math.PI / 180 }, grad: { factor: 10 / 9 } },
  rad: { deg: { factor: 180 / Math.PI }, grad: { factor: 200 / Math.PI } },
  grad: { deg: { factor: 0.9 }, rad: { factor: Math.PI / 200 } },

  // Pressure
  Pa: { kPa: { factor: 0.001 }, atm: { factor: 9.8692e-6 }, bar: { factor: 1e-5 }, psi: { factor: 0.000145038 } },
  kPa: { Pa: { factor: 1000 }, atm: { factor: 0.00986923 }, bar: { factor: 0.01 }, psi: { factor: 0.145038 } },
  atm: { Pa: { factor: 101325 }, kPa: { factor: 101.325 }, bar: { factor: 1.01325 }, psi: { factor: 14.6959 } },
  bar: { Pa: { factor: 100000 }, kPa: { factor: 100 }, atm: { factor: 0.986923 }, psi: { factor: 14.5038 } },
  psi: { Pa: { factor: 6894.76 }, kPa: { factor: 6.89476 }, atm: { factor: 0.068046 }, bar: { factor: 0.0689476 } },

  // Data storage
  B: { KB: { factor: 1 / 1024 }, MB: { factor: 1 / (1024 ** 2) }, GB: { factor: 1 / (1024 ** 3) }, TB: { factor: 1 / (1024 ** 4) }, bit: { factor: 8 } },
  KB: { B: { factor: 1024 }, MB: { factor: 1 / 1024 }, GB: { factor: 1 / (1024 ** 2) }, TB: { factor: 1 / (1024 ** 3) } },
  MB: { B: { factor: 1024 ** 2 }, KB: { factor: 1024 }, GB: { factor: 1 / 1024 }, TB: { factor: 1 / (1024 ** 2) } },
  GB: { B: { factor: 1024 ** 3 }, KB: { factor: 1024 ** 2 }, MB: { factor: 1024 }, TB: { factor: 1 / 1024 } },
  TB: { B: { factor: 1024 ** 4 }, KB: { factor: 1024 ** 3 }, MB: { factor: 1024 ** 2 }, GB: { factor: 1024 } },

  // Time
  s: { ms: { factor: 1000 }, min: { factor: 1 / 60 }, hr: { factor: 1 / 3600 }, day: { factor: 1 / 86400 } },
  ms: { s: { factor: 0.001 }, min: { factor: 1 / 60000 } },
  min: { s: { factor: 60 }, hr: { factor: 1 / 60 }, day: { factor: 1 / 1440 } },
  hr: { s: { factor: 3600 }, min: { factor: 60 }, day: { factor: 1 / 24 } },
  day: { s: { factor: 86400 }, min: { factor: 1440 }, hr: { factor: 24 } },
};

function convertTemperature(value: number, from: string, to: string): { result: number; chain: string[] } {
  const chain: string[] = [];
  let celsius: number;

  switch (from.toLowerCase()) {
    case 'c': case 'celsius':
      celsius = value;
      chain.push(`${value} °C`);
      break;
    case 'f': case 'fahrenheit':
      celsius = (value - 32) * 5 / 9;
      chain.push(`${value} °F → (${value} - 32) × 5/9 = ${celsius.toFixed(4)} °C`);
      break;
    case 'k': case 'kelvin':
      celsius = value - 273.15;
      chain.push(`${value} K → ${value} - 273.15 = ${celsius.toFixed(4)} °C`);
      break;
    default:
      throw new Error(`Unknown temperature unit: ${from}`);
  }

  let result: number;
  switch (to.toLowerCase()) {
    case 'c': case 'celsius':
      result = celsius;
      chain.push(`= ${result.toFixed(4)} °C`);
      break;
    case 'f': case 'fahrenheit':
      result = celsius * 9 / 5 + 32;
      chain.push(`${celsius.toFixed(4)} °C × 9/5 + 32 = ${result.toFixed(4)} °F`);
      break;
    case 'k': case 'kelvin':
      result = celsius + 273.15;
      chain.push(`${celsius.toFixed(4)} °C + 273.15 = ${result.toFixed(4)} K`);
      break;
    default:
      throw new Error(`Unknown temperature unit: ${to}`);
  }

  return { result, chain };
}

const tempUnits = ['c', 'celsius', 'f', 'fahrenheit', 'k', 'kelvin'];

export function unitConverter(args: { value: number; from_unit: string; to_unit: string }): {
  result: number;
  conversion_chain: string[];
} {
  const { value, from_unit, to_unit } = args;

  if (from_unit === to_unit) {
    return { result: value, conversion_chain: [`${value} ${from_unit} = ${value} ${to_unit} (same unit)`] };
  }

  // Temperature special handling
  if (tempUnits.includes(from_unit.toLowerCase()) && tempUnits.includes(to_unit.toLowerCase())) {
    const { result, chain } = convertTemperature(value, from_unit, to_unit);
    return { result, conversion_chain: chain };
  }

  // Try mathjs first
  try {
    const result = math.number(math.unit(value, from_unit).to(to_unit));
    return {
      result: result as number,
      conversion_chain: [`${value} ${from_unit} = ${result} ${to_unit} (via mathjs unit conversion)`],
    };
  } catch {
    // Fall back to manual lookup
  }

  const fromFactors = conversionFactors[from_unit];
  if (fromFactors && fromFactors[to_unit]) {
    const { factor } = fromFactors[to_unit];
    const result = value * factor;
    return {
      result,
      conversion_chain: [
        `${value} ${from_unit}`,
        `× ${factor}`,
        `= ${result} ${to_unit}`,
      ],
    };
  }

  throw new Error(`Cannot convert from ${from_unit} to ${to_unit}. Unsupported unit pair.`);
}
