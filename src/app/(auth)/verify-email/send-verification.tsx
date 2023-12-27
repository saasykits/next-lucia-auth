"use client";

import { LoadingButton } from "@/components/loading-button";
import { toast } from "sonner";
import { ExclamationTriangleIcon } from "@/components/icons";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const MAIL_SENT_TIME_KEY = "lastSendTime";
const MAIL_SEND_INTERVAL = 5 * 60 * 1000;

export const SendVerification = () => {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [timerLoaded, setTimerLoaded] = useState(false);

  const resend = useMutation({
    mutationKey: ["send-verification"],
    mutationFn: async () => {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
      });
      const data = (await res.json()) as Record<string, string>;

      if (!res.ok) {
        throw new Error(data.error ?? "Invalid register");
      }
      return data;
    },
    onSuccess: () => {
      localStorage.setItem(MAIL_SENT_TIME_KEY, new Date().toISOString());
      toast("Email sent", {
        description: "Verification email sent successfully.",
      });
    },
    onError: (err) => {
      console.error(err);
      toast("Could not send email", {
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />,
      });
    },
  });

  useEffect(() => {
    const lastSendTime = localStorage.getItem(MAIL_SENT_TIME_KEY);
    setTimerLoaded(true);
    if (!lastSendTime) return;
    const time = new Date(lastSendTime);
    const now = new Date();
    const diff = MAIL_SEND_INTERVAL - (now.getTime() - time.getTime());
    if (diff < 0) return;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (minutes > 5) return;
    setMinutes(minutes);
    setSeconds(seconds);
  }, [resend.status]);

  useEffect(() => {
    const myInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(myInterval);
        } else {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }
    }, 1000);
    return () => {
      clearInterval(myInterval);
    };
  });

  const canSend = timerLoaded && minutes === 0 && seconds === 0;

  return (
    <div>
      <LoadingButton
        disabled={!canSend}
        onClick={() => resend.mutate()}
        loading={resend.isLoading}
      >
        Send verification email
      </LoadingButton>

      {minutes === 0 && seconds === 0 ? null : (
        <p className="mt-2 text-xs text-muted-foreground">
          Time left before you can resend: {minutes}:
          {seconds < 10 ? `0${seconds}` : seconds}
        </p>
      )}
    </div>
  );
};
