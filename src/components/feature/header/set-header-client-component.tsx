"use client";

import { useEffect } from 'react';
import { useHeader } from '@/components/feature/header/header-context';

interface SetHeaderClientComponentProps {
  title: string;
}

export default function SetHeaderClientComponent({ title }: SetHeaderClientComponentProps) {
  const { setHeaderTitle } = useHeader();

  useEffect(() => {
    setHeaderTitle(title);
  }, [setHeaderTitle, title]);

  return null; // This component does not render any UI itself
}
