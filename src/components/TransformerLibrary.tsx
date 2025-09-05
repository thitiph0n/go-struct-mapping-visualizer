import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppState } from '../store/AppStateContext';

const TRANSFORMER_TEMPLATES = [
  {
    id: 'string_to_int',
    name: 'String to Int',
    description: 'Convert string to integer with error handling',
    inputType: 'string',
    outputType: 'int',
    code: `func stringToInt(s string) (int, error) {
	return strconv.Atoi(s)
}`
  },
  {
    id: 'timestamp_to_time',
    name: 'Timestamp to Time',
    description: 'Convert Unix timestamp to time.Time',
    inputType: 'int64',
    outputType: 'time.Time',
    code: `func timestampToTime(ts int64) time.Time {
	return time.Unix(ts, 0)
}`
  },
  {
    id: 'slice_filter',
    name: 'Filter Slice',
    description: 'Filter slice based on condition',
    inputType: '[]T',
    outputType: '[]T',
    code: `func filterSlice[T any](slice []T, predicate func(T) bool) []T {
	result := make([]T, 0, len(slice))
	for _, item := range slice {
		if predicate(item) {
			result = append(result, item)
		}
	}
	return result
}`
  },
  {
    id: 'map_transform',
    name: 'Map Transform',
    description: 'Transform slice elements',
    inputType: '[]T',
    outputType: '[]U',
    code: `func mapTransform[T, U any](slice []T, transform func(T) U) []U {
	result := make([]U, len(slice))
	for i, item := range slice {
		result[i] = transform(item)
	}
	return result
}`
  },
  {
    id: 'nil_check',
    name: 'Nil Check',
    description: 'Safe nil check with default value',
    inputType: '*T',
    outputType: 'T',
    code: `func nilCheck[T any](ptr *T, defaultValue T) T {
	if ptr != nil {
		return *ptr
	}
	return defaultValue
}`
  }
];

export const TransformerLibrary: React.FC = () => {
  const { dispatch } = useAppState();

  const handleAddTransformer = (template: typeof TRANSFORMER_TEMPLATES[0]) => {
    const transformer = {
      id: `transformer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: template.name,
      code: template.code,
      inputType: template.inputType,
      outputType: template.outputType,
      isValid: true
    };

    dispatch({ type: 'ADD_TRANSFORMER', payload: transformer });

    const node = {
      id: `node_${transformer.id}`,
      type: 'transformer' as const,
      position: { x: Math.random() * 500, y: Math.random() * 400 },
      data: { transformerId: transformer.id, label: transformer.name },
    };
    dispatch({ type: 'ADD_NODE', payload: node });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Transformer Library
        </h2>
        
        <div className="space-y-3 pr-1">
          {TRANSFORMER_TEMPLATES.map((template) => (
            <Card key={template.id} className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground text-sm truncate">{template.name}</h3>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </div>
                  
                  <Button
                    size="sm"
                    className="ml-2 text-xs h-6"
                    onClick={() => handleAddTransformer(template)}
                  >
                    Add
                  </Button>
                </div>
                
                <div className="flex gap-2 text-xs mb-2">
                  <Badge variant="outline" className="text-xs">
                    {template.inputType} → {template.outputType}
                  </Badge>
                </div>
                
                <details>
                  <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                    Show code
                  </summary>
                  <div className="mt-2 bg-muted p-2 rounded text-xs font-mono overflow-x-auto max-h-24 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{template.code}</pre>
                  </div>
                </details>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-6 sticky bottom-0 bg-background pt-4">
          <Button variant="ghost" size="sm" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Transformer
          </Button>
        </div>
      </div>
    </div>
  );
};