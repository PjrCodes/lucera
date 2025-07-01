import { Skeleton } from "@/components/ui/skeleton";

export function CourseHeaderSkeleton() {
  return (
    <div className="mb-6 animate-in fade-in-50 duration-500">
      <Skeleton className="h-9 w-3/4 mb-4" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  );
}

export function CourseDescriptionSkeleton() {
  return (
    <div className="mb-6 animate-in fade-in-50 duration-700">
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-2" />
      <Skeleton className="h-4 w-4/5 mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function CourseUnitsSkeleton() {
  return (
    <div className="mb-6 animate-in fade-in-50 duration-1000">
      <Skeleton className="h-7 w-20 mb-4" />
      <div className="space-y-3">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="flex items-start space-x-2">
            <Skeleton className="h-2 w-2 rounded-full mt-2 flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CourseTimelineSkeleton() {
  return (
    <div className="animate-in fade-in-50 duration-1200">
      <Skeleton className="h-7 w-24 mb-4" />
      <div className="overflow-x-auto">
        <div className="min-w-full border rounded-lg">
          {/* Table header */}
          <div className="border-b bg-gray-50 p-2">
            <div className="grid grid-cols-6 gap-2">
              {[
                "Type",
                "Title",
                "Start Date",
                "Due Date",
                "Grade Release",
                "Inferred",
              ].map((_, idx) => (
                <Skeleton key={idx} className="h-4 w-full" />
              ))}
            </div>
          </div>
          {/* Table rows */}
          {[...Array(6)].map((_, rowIdx) => (
            <div key={rowIdx} className="border-b p-2">
              <div className="grid grid-cols-6 gap-2">
                {[...Array(6)].map((_, colIdx) => (
                  <Skeleton key={colIdx} className="h-4 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Skeleton className="h-3 w-48 mt-2" />
    </div>
  );
}

export function CoursePageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <CourseHeaderSkeleton />
      <CourseDescriptionSkeleton />
      <CourseUnitsSkeleton />
      <CourseTimelineSkeleton />
    </div>
  );
}
