import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionInfoProps {
  nutrition: Nutrition;
  name: string;
}

export const NutritionInfo: React.FC<NutritionInfoProps> = ({ nutrition, name }) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <strong>Calories:</strong>
          </div>
          <div>{nutrition.calories}</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <strong>Protein:</strong>
          </div>
          <div>{nutrition.protein}g</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <strong>Carbs:</strong>
          </div>
          <div>{nutrition.carbs}g</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <strong>Fat:</strong>
          </div>
          <div>{nutrition.fat}g</div>
        </div>
      </CardContent>
    </Card>
  );
};
