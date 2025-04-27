"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NutritionInfo } from "@/components/nutrition-info";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { analyzeFoodImage, AnalyzeFoodImageOutput } from "@/ai/flows/analyze-food-image";
import { Alert, AlertDescription as AD, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [nutritionInfo, setNutritionInfo] = useState<AnalyzeFoodImageOutput | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();
  }, []);


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeImage = async () => {
    if (!image) {
      setError("Please upload an image.");
      return;
    }

    setLoading(true);
    setError(null);
    setNutritionInfo(null);

    try {
      const result = await analyzeFoodImage({ photoDataUri: image, description: "" });
      setNutritionInfo(result);
    } catch (e: any) {
      setError(e.message || "Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-12 bg-light-gray">
      <h1 className="text-4xl font-bold mb-8 text-primary">NutriSnap</h1>

      {/* Image Analysis Card */}
      <Card className="w-full max-w-md space-y-4">
        <CardHeader>
          <CardTitle>Image Analysis</CardTitle>
          <CardDescription>Upload an image of your food to analyze its macronutrients.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="image">Upload Image</Label>
            <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
          {image && (
            <img src={image} alt="Uploaded Food" className="rounded-md object-contain max-h-48 w-full" />
          )}

          <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted />

          { !(hasCameraPermission) && (
            <Alert variant="destructive">
                      <AlertTitle>Camera Access Required</AlertTitle>
                      <AD>
                        Please allow camera access to use this feature.
                      </AD>
            </Alert>
          )
          }

          <Button onClick={handleAnalyzeImage} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Image"}
          </Button>
        </CardContent>
      </Card>

      {/* Display Nutrition Information */}
      {nutritionInfo && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-primary">Nutrition Information</h2>
          <NutritionInfo nutrition={nutritionInfo.foodItem.nutrition} name={nutritionInfo.foodItem.name} />
        </div>
      )}

      {/* Error Dialog */}
      {error && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">View Error</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>{error}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <AlertDialogAction>Okay</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
