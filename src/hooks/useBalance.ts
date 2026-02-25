import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'banque_alimentaire_balance_config';

export interface BalanceConfig {
  baudRate: number;
  dataBits: 7 | 8;
  stopBits: 1 | 2;
  parity: 'none' | 'even' | 'odd';
  flowControl: 'none' | 'hardware';
  protocol: 'auto' | 'pennsylvania' | 'toledo' | 'mettler' | 'avery' | 'cas' | 'ohaus' | 'digi' | 'bizerba' | 'sartorius' | 'ad' | 'generic';
  requestCommand?: string; // Comando para solicitar peso
  continuousMode: boolean; // Modo continuo o bajo demanda
}

export interface BalanceData {
  weight: number;
  unit: 'kg' | 'g' | 'lb' | 'oz';
  stable: boolean;
  timestamp: number;
}

const DEFAULT_CONFIG: BalanceConfig = {
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  flowControl: 'none',
  protocol: 'auto',
  continuousMode: true
};

// Cargar configuración guardada desde localStorage
const loadSavedConfig = (): BalanceConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (error) {
    console.error('Error loading saved balance config:', error);
  }
  return DEFAULT_CONFIG;
};

// Guardar configuración en localStorage
const saveConfig = (config: BalanceConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving balance config:', error);
  }
};

// Protocolos comunes de balanzas - Expandido para mayor compatibilidad
const SCALE_PROTOCOLS = {
  // Pennsylvania Scale: formato flexible con peso y unidad
  pennsylvania: /(?:[\\x02])?([+-]?[0-9]+\\.?[0-9]*)\s?(kg|g|lb|oz|KG|G|LB|OZ)(?:[\\x03\\r\\n])?/i,
  
  // Toledo: STX + peso + unidad + estabilidad + ETX
  toledo: /\x02([0-9\s\.\-]+)\s?(kg|g|lb|oz)\s?([*\s])\x03/i,
  
  // Mettler Toledo: S/N + peso + unidad
  mettler: /([NS])\s+([0-9\s\.\-]+)\s?(kg|g|lb|oz)/i,
  
  // Avery Weigh-Tronix: W + peso + unidad
  avery: /W\s+([0-9\.\-]+)\s?(kg|g|lb|oz)/i,
  
  // CAS (Common format)
  cas: /(?:ST|US|OL)?,?\s*([0-9\.\-]+)\s?(kg|g|lb|oz)\s?([*\s]?)/i,
  
  // Ohaus: múltiples formatos
  ohaus: /(?:S|D)\s+([0-9\.\-]+)\s?(kg|g|lb|oz)/i,
  
  // Digi: formato estándar
  digi: /([0-9\.\-]+)\s?(kg|g|lb|oz)\s?([ST|US]?)/i,
  
  // Bizerba: formato con prefijo
  bizerba: /(?:N|G)\s+([0-9\.\-]+)\s?(kg|g|lb|oz)/i,
  
  // Sartorius: formato S + peso
  sartorius: /S\s+([0-9\.\-]+)\s?(kg|g|lb|oz)/i,
  
  // A&D (AND): múltiples formatos
  ad: /(?:ST|US)?,?\s*([0-9\.\-]+)\s?(kg|g|lb|oz)/i,
  
  // Generic format: número seguido de unidad (más flexible)
  generic: /(?:[\x02\x03])?([+-]?[0-9]+\.?[0-9]*)\s?(kg|g|lb|oz|KG|G|LB|OZ)?(?:[\x02\x03])?/i
};

// Comandos de solicitud de peso por marca
const WEIGHT_REQUEST_COMMANDS = {
  toledo: 'W\r\n',
  mettler: 'S\r\n',
  avery: 'P\r\n',
  cas: 'Q\r\n',
  ohaus: 'P\r\n',
  digi: 'W\r\n',
  bizerba: 'w\r\n',
  sartorius: 'S\r\n',
  ad: 'Q\r\n',
  generic: 'P\r\n'
};

export function useBalance(customConfig?: Partial<BalanceConfig>) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentWeight, setCurrentWeight] = useState<BalanceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectedProtocol, setDetectedProtocol] = useState<string>('unknown');
  const [availablePorts, setAvailablePorts] = useState<SerialPort[]>([]);
  
  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const configRef = useRef<BalanceConfig>({ ...loadSavedConfig(), ...customConfig });

  // Listar puertos disponibles (solo los que ya tienen permiso)
  const listPorts = useCallback(async () => {
    if (!('serial' in navigator)) return [];
    
    try {
      const ports = await navigator.serial.getPorts();
      setAvailablePorts(ports);
      return ports;
    } catch (err: any) {
      // Ignorar completamente errores de permisos - son normales
      return [];
    }
  }, []);

  // Verificar soporte de Web Serial API
  useEffect(() => {
    const supported = 'serial' in navigator;
    setIsSupported(supported);
    
    // NO intentar listar puertos aquí - causa SecurityError
    // Los puertos se listarán solo cuando el usuario interactúe
  }, []);

  // Parsear datos según protocolo
  const parseScaleData = useCallback((data: string): BalanceData | null => {
    const config = configRef.current;
    
    // Limpiar datos
    const cleanData = data.trim();
    
    // Intentar detectar protocolo automáticamente
    if (config.protocol === 'auto') {
      for (const [protocolName, regex] of Object.entries(SCALE_PROTOCOLS)) {
        const match = cleanData.match(regex);
        if (match) {
          setDetectedProtocol(protocolName);
          return extractWeightData(match, protocolName);
        }
      }
    } else {
      // Usar protocolo específico
      const regex = SCALE_PROTOCOLS[config.protocol as keyof typeof SCALE_PROTOCOLS];
      if (regex) {
        const match = cleanData.match(regex);
        if (match) {
          return extractWeightData(match, config.protocol);
        }
      }
    }
    
    return null;
  }, []);

  // Extraer peso de la coincidencia regex
  const extractWeightData = (match: RegExpMatchArray, protocol: string): BalanceData | null => {
    try {
      let weight: number;
      let unit: 'kg' | 'g' | 'lb' | 'oz' = 'kg';
      let stable = true;

      switch (protocol) {
        case 'pennsylvania':
          weight = parseFloat(match[1]);
          unit = (match[2]?.toLowerCase() as any) || 'kg';
          stable = true;
          break;
          
        case 'toledo':
          weight = parseFloat(match[1].replace(/\s/g, ''));
          unit = (match[2]?.toLowerCase() as any) || 'kg';
          stable = match[3] !== '*';
          break;
          
        case 'mettler':
          stable = match[1] === 'S';
          weight = parseFloat(match[2].replace(/\s/g, ''));
          unit = (match[3]?.toLowerCase() as any) || 'kg';
          break;
          
        case 'avery':
          weight = parseFloat(match[1]);
          unit = (match[2]?.toLowerCase() as any) || 'kg';
          break;
          
        case 'cas':
          weight = parseFloat(match[1]);
          unit = (match[2]?.toLowerCase() as any) || 'kg';
          stable = !match[3] || match[3].trim() !== '*';
          break;
          
        case 'ohaus':
          stable = match[0].startsWith('S');
          weight = parseFloat(match[1]);
          unit = (match[2]?.toLowerCase() as any) || 'kg';
          break;
          
        case 'digi':
          weight = parseFloat(match[1]);
          unit = (match[2]?.toLowerCase() as any) || 'kg';
          stable = match[3] === 'ST' || !match[3];
          break;
          
        case 'bizerba':
          stable = match[0].startsWith('N'); // N = Net/Stable, G = Gross
          weight = parseFloat(match[1]);
          unit = (match[2]?.toLowerCase() as any) || 'kg';
          break;
          
        case 'sartorius':
          weight = parseFloat(match[1]);
          unit = (match[2]?.toLowerCase() as any) || 'kg';
          stable = true;
          break;
          
        case 'ad':
          weight = parseFloat(match[1]);
          unit = (match[2]?.toLowerCase() as any) || 'kg';
          stable = match[0].includes('ST') || !match[0].includes('US');
          break;
          
        default: // generic
          weight = parseFloat(match[1]);
          unit = (match[2]?.toLowerCase() as any) || 'kg';
          stable = true;
          break;
      }

      if (isNaN(weight)) return null;

      return {
        weight,
        unit,
        stable,
        timestamp: Date.now()
      };
    } catch (err) {
      console.error('Error parsing weight data:', err);
      return null;
    }
  };

  // Leer datos del puerto serial
  const readLoop = useCallback(async () => {
    if (!portRef.current || !portRef.current.readable) return;

    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = portRef.current.readable.pipeTo(textDecoder.writable);
    readerRef.current = textDecoder.readable.getReader();

    let buffer = '';

    try {
      while (true) {
        const { value, done } = await readerRef.current.read();
        if (done) break;

        buffer += value;
        
        // Procesar líneas completas
        const lines = buffer.split(/[\r\n]+/);
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            const weightData = parseScaleData(line);
            if (weightData) {
              setCurrentWeight(weightData);
              setError(null);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'NetworkError') {
        setError(`Error de lectura: ${err.message}`);
      }
    } finally {
      readerRef.current?.releaseLock();
      await readableStreamClosed.catch(() => {});
    }
  }, [parseScaleData]);

  // Conectar a la balanza
  const connect = useCallback(async () => {
    if (!isSupported) {
      setError('Web Serial API no está soportado en este navegador');
      return false;
    }

    try {
      const config = configRef.current;
      
      // Solicitar puerto serial
      const port = await navigator.serial.requestPort();
      
      // Abrir puerto con configuración
      await port.open({
        baudRate: config.baudRate,
        dataBits: config.dataBits,
        stopBits: config.stopBits,
        parity: config.parity,
        flowControl: config.flowControl
      });

      portRef.current = port;
      setIsConnected(true);
      setError(null);

      // Iniciar lectura de datos
      readLoop();

      return true;
    } catch (err: any) {
      setError(`Error de conexión: ${err.message}`);
      return false;
    }
  }, [isSupported, readLoop]);

  // Desconectar balanza
  const disconnect = useCallback(async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
      }

      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }

      setIsConnected(false);
      setCurrentWeight(null);
      setDetectedProtocol('unknown');
      setError(null);
    } catch (err: any) {
      setError(`Error al desconectar: ${err.message}`);
    }
  }, []);

  // Actualizar configuración
  const updateConfig = useCallback((newConfig: Partial<BalanceConfig>) => {
    const updatedConfig = { ...configRef.current, ...newConfig };
    configRef.current = updatedConfig;
    saveConfig(updatedConfig);
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (portRef.current) {
        disconnect();
      }
    };
  }, [disconnect]);

  return {
    isSupported,
    isConnected,
    currentWeight,
    error,
    detectedProtocol,
    connect,
    disconnect,
    updateConfig,
    config: configRef.current,
    availablePorts
  };
}