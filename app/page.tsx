'use client'

import AuthForm from './components/auth-form'
import { Button } from "@/components/ui/button"
import React, { useState, useEffect } from 'react';


export default function Home() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscription, setSubscription] = useState(null)
  const [registration, setRegistration] = useState(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.workbox !== undefined) {
      // run only in browser
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          if (sub && !(sub.expirationTime && Date.now() > sub.expirationTime - 5 * 60 * 1000)) {
            setSubscription(sub)
            setIsSubscribed(true)
          }
        })
        setRegistration(reg)
      })
    }
  }, [])

  const subscribeButtonOnClick = async (event:any) => {
    event.preventDefault()
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY)
    })
    // TODO: you should call your API to save subscription data on server in order to send web push notification from server
    setSubscription(sub)
    setIsSubscribed(true)
    console.log('web push subscribed!')
    console.log(sub)
  }

  const unsubscribeButtonOnClick = async (event:any) => {
    event.preventDefault()
    await subscription.unsubscribe()
    // TODO: you should call your API to delete or invalidate subscription data on server
    setSubscription(null)
    setIsSubscribed(false)
    console.log('web push unsubscribed!')
  }

  const sendNotificationButtonOnClick = async (event:any) => {
    event.preventDefault()
    if (subscription == null) {
      console.error('web push not subscribed')
      return
    }

    await fetch('/api/notification', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        subscription
      })
    })
  }


  return (
    <div className="row flex flex-col justify-between absolute inset-0">
      <div className="p-4 w-full text-white text-center bg-blue-400">
        PWA Test
      </div>
      {/* <div className="col-6 auth-widget">
        <AuthForm />
      </div> */}

      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Notifications in a single tap.</h1>
        <p className="text-xl text-left">Press the button below to launch a notfication</p>
        <Button onClick={subscribeButtonOnClick} className="m-4" variant="outline">Subscribe</Button>
      </div>

      <div className="p-8 text-center">
        <Button onClick={unsubscribeButtonOnClick} className="m-4" variant="outline">UnSubscribe</Button>
      </div>

      <div className="p-8 text-center">
        <Button onClick={sendNotificationButtonOnClick} className="m-4" variant="outline">Send Notification</Button>
      </div>

      <div className="w-full grid grid-cols-3 pb-8 mx-2">
        <div className="p-4 text-center bg-slate-100 rounded-lg">
          Tab
        </div>
        <div className="p-4 text-center rounded-lg">
          Tab
        </div>
        <div className="p-4 text-center rounded-lg">
          Tab
        </div>
      </div>
    </div>
  )
}
