import React, { useState } from 'react';
import { TextareaSpellCheck } from '../ui/textarea-spell-check';
import { Button } from '../ui/button';
import { AlertCircle } from 'lucide-react';

export function TestSpellCheck() {
  const [texto, setTexto] = useState('');
  
  const ejemplosDeErrores = [
    'Necesito una comande urgente de produits alimantaires.',
    'El départment necesita volantaires para la distribusion.',
    'La livrezon de quantiters importentes está retrasada.',
    'Necesitamos más bénévols para el comptwar.',
    'Esta demende es urjente y nésessaire.'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-4">Test de Correction Orthographique</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Essayez de taper des mots avec des erreurs comme:
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li><span className="text-red-600">comande</span> → commande</li>
            <li><span className="text-red-600">alimantaire</span> → alimentaire</li>
            <li><span className="text-red-600">volantaire</span> → volontaire</li>
            <li><span className="text-red-600">départment</span> → département</li>
            <li><span className="text-red-600">urjent</span> → urgent</li>
          </ul>
        </div>

        <div className="space-y-4">
          <TextareaSpellCheck
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Tapez ici pour tester la correction orthographique..."
            rows={8}
            language="fr"
          />
          
          <div className="flex gap-2">
            <Button
              onClick={() => setTexto(ejemplosDeErrores[Math.floor(Math.random() * ejemplosDeErrores.length)])}
              variant="outline"
            >
              Charger un exemple avec erreurs
            </Button>
            <Button
              onClick={() => setTexto('')}
              variant="outline"
            >
              Effacer
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Comment utiliser:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Tapez un texte avec des erreurs orthographiques</li>
                <li>Attendez 500ms (le système vérifie automatiquement)</li>
                <li>Les erreurs apparaîtront dans le panneau de suggestions</li>
                <li>Cliquez sur "Corriger" pour appliquer la suggestion</li>
                <li>Cliquez sur "X" pour ignorer la suggestion</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
