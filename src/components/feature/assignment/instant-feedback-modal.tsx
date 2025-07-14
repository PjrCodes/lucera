"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { MyMarkdown } from "@/components/core/markdown";
import { FiX, FiLoader, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

interface InstantFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: string | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export default function InstantFeedbackModal({
  isOpen,
  onClose,
  feedback,
  isLoading,
  error,
  onRetry,
}: InstantFeedbackModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FiCheckCircle className="w-5 h-5 text-green-600" />
            Instant Feedback ✨
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <FiLoader className="w-8 h-8 text-primary-600 animate-spin mb-4" />
              <p className="text-primary-700 text-center">
                Our AI is analyzing your submission and generating personalized feedback...
              </p>
              <p className="text-sm text-primary-500 mt-2">
                This may take a few moments
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <FiAlertTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-2">
                    Failed to Generate Feedback
                  </h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  {onRetry && (
                    <PrimaryButton onClick={onRetry} size="sm">
                      Try Again
                    </PrimaryButton>
                  )}
                </div>
              </div>
            </div>
          )}

          {feedback && !isLoading && !error && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-800">Feedback Generated</p>
                    <p className="text-green-700">
                      Here&apos;s your personalized feedback based on your submission.
                      Use this to improve your work before final submission.
                    </p>
                  </div>
                </div>
              </div>

              <div className="prose prose-sm max-w-none">
                <div className="bg-white border border-primary-200 rounded-lg p-6">
                  <MyMarkdown>{feedback}</MyMarkdown>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <FiAlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800">Important Note</p>
                    <p className="text-blue-700">
                      This feedback is AI-generated and should be used as a guide.
                      Your instructor&apos;s final evaluation may differ.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && !feedback && (
            <div className="text-center py-8">
              <p className="text-primary-600">
                Click &quot;Get Feedback&quot; to receive AI-powered insights on your submission.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <SecondaryButton onClick={onClose} variant="outline">
            <FiX className="w-4 h-4 mr-2" />
            Close
          </SecondaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
