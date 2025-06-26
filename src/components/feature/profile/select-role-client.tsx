"use client";


import React from "react";
import { useFormState } from "react-dom";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { RadioGroup, RadioItem } from "@/components/core/inputs/radio";
import { setUserRole } from "../../../app/(no-header)/select-role/page";

export default function SelectRoleClient({
  searchParams,
  currentRole,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
  currentRole: string | null;
}) {
  const [state, formAction] = useFormState(setUserRole, { success: false });

  return (
    <form action={formAction} className="space-y-4">
      {/* Add hidden fields for each query param */}
      {searchParams &&
        Object.entries(searchParams).map(([key, value]) =>
          Array.isArray(value) ? (
            value.map((v, i) => (
              <input key={key + i} type="hidden" name={key} value={v} />
            ))
          ) : (
            <input key={key} type="hidden" name={key} value={value ?? ""} />
          )
        )}

      <div className="space-y-2">
        <RadioGroup name="role" defaultValue={currentRole || undefined}>
          <RadioItem value="student">Student</RadioItem>
          <RadioItem value="teacher">Teacher</RadioItem>
        </RadioGroup>
        {state.errors?.role && (
          <p className="text-red-600 text-sm">{state.errors.role[0]}</p>
        )}
      </div>

      {state.message && !state.success && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {state.message}
        </div>
      )}

      <SecondaryButton type="submit">Continue</SecondaryButton>
    </form>
  );
}
  