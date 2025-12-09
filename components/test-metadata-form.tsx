"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  CLASS_OPTIONS,
  MARKING_TYPE_OPTIONS,
  SPECIALIZATION_OPTIONS,
  SUBJECT_OPTIONS,
  type TestFormValues,
} from "@/lib/test-form";

interface TestMetadataFormProps {
  values: TestFormValues;
  onChange: <K extends keyof TestFormValues>(
    field: K,
    value: TestFormValues[K]
  ) => void;
}

export function TestMetadataForm({ values, onChange }: TestMetadataFormProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-title">Title</Label>
            <Input
              id="test-title"
              placeholder="e.g., JEE Advanced Mock Test"
              value={values.title}
              onChange={(event) => onChange("title", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-description">Description</Label>
            <Textarea
              id="test-description"
              rows={4}
              placeholder="Add important details, structure, and instructions"
              value={values.description}
              onChange={(event) => onChange("description", event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Audience & Scope</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Subjects</Label>
            <MultiSelect
              value={values.subjects}
              onChange={(selection) => onChange("subjects", selection)}
              options={SUBJECT_OPTIONS}
              placeholder="Select one or more subjects"
            />
          </div>

          <div className="space-y-2">
            <Label>Classes</Label>
            <MultiSelect
              value={values.classes}
              onChange={(selection) => onChange("classes", selection)}
              options={CLASS_OPTIONS}
              placeholder="Select class levels"
            />
          </div>

          <div className="space-y-2">
            <Label>Specializations</Label>
            <MultiSelect
              value={values.specializations}
              onChange={(selection) => onChange("specializations", selection)}
              options={SPECIALIZATION_OPTIONS}
              placeholder="Select specialization tracks"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Test Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="test-duration">Duration (minutes)</Label>
            <Input
              id="test-duration"
              type="number"
              min={1}
              value={values.durationMinutes}
              onChange={(event) =>
                onChange("durationMinutes", event.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-marks">Overall Marks</Label>
            <Input
              id="test-marks"
              type="number"
              min={1}
              value={values.overallMarks}
              onChange={(event) => onChange("overallMarks", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-marking-type">Marking Type</Label>
            <Select
              value={values.markingType}
              onValueChange={(value) =>
                onChange("markingType", value as TestFormValues["markingType"])
              }
            >
              <SelectTrigger id="test-marking-type">
                <SelectValue placeholder="Choose type" />
              </SelectTrigger>
              <SelectContent>
                {MARKING_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Advanced Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="test-instructions">Instructions (optional)</Label>
              <Textarea
                id="test-instructions"
                rows={3}
                placeholder="Share guidelines that learners see before the test"
                value={values.instructions}
                onChange={(event) =>
                  onChange("instructions", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passing-marks">Passing Marks (optional)</Label>
              <Input
                id="passing-marks"
                type="number"
                min={0}
                value={values.passingMarks}
                onChange={(event) =>
                  onChange("passingMarks", event.target.value)
                }
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Negative Marking</Label>
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Enable negative marking</p>
                  <p className="text-xs text-muted-foreground">
                    Deduct marks for incorrect answers
                  </p>
                </div>
                <Switch
                  checked={values.negativeMarking}
                  onCheckedChange={(checked) =>
                    onChange("negativeMarking", checked)
                  }
                />
              </div>
              {values.negativeMarking && (
                <div className="space-y-1">
                  <Label htmlFor="negative-ratio">Negative Ratio (0 - 1)</Label>
                  <Input
                    id="negative-ratio"
                    type="number"
                    step="0.05"
                    min={0}
                    max={1}
                    value={values.negativeMarkingRatio}
                    onChange={(event) =>
                      onChange("negativeMarkingRatio", event.target.value)
                    }
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Test Series</Label>
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Part of a Test Series</p>
                  <p className="text-xs text-muted-foreground">
                    Link this test to a specific series
                  </p>
                </div>
                <Switch
                  checked={values.isTestSeriesSpecific}
                  onCheckedChange={(checked) =>
                    onChange("isTestSeriesSpecific", checked)
                  }
                />
              </div>
              {values.isTestSeriesSpecific && (
                <div className="space-y-1">
                  <Label htmlFor="test-series-id">Test Series ID</Label>
                  <Input
                    id="test-series-id"
                    placeholder="Enter Test Series ID"
                    value={values.testSeriesId}
                    onChange={(event) =>
                      onChange("testSeriesId", event.target.value)
                    }
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <PreferenceToggle
              label="Shuffle Questions"
              description="Randomize question order for each attempt"
              checked={values.shuffleQuestions}
              onCheckedChange={(checked) =>
                onChange("shuffleQuestions", checked)
              }
            />
            <PreferenceToggle
              label="Show Results"
              description="Display results immediately after submission"
              checked={values.showResult}
              onCheckedChange={(checked) => onChange("showResult", checked)}
            />
            <PreferenceToggle
              label="Allow Review"
              description="Let students review responses after the test"
              checked={values.allowReview}
              onCheckedChange={(checked) => onChange("allowReview", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface PreferenceToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function PreferenceToggle({
  label,
  description,
  checked,
  onCheckedChange,
}: PreferenceToggleProps) {
  return (
    <div className="rounded-lg border px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
    </div>
  );
}
