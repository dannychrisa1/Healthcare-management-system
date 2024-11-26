"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import CustomFormField from "../CustomFormField"
import SubmitButton from "../SubmitButton"
import { UserFormValidation } from "@/lib/validation"
import { useRouter } from "next/navigation"
import { createUser } from "@/lib/actions/patient.actions"

export enum FormFieldType {
   INPUT = 'input',
   TEXTAREA = 'textarea',
   PHONE_INPUT = 'phoneinput',
   CHECKBOX = 'checkbox',
   DATE_PICKER = 'datePicker',
   SELECT = 'select',
   SKELETON = 'skeleton',

}



const PatientForm = () => {
    const [isClient, setIsClient] = useState(false)
    const router = useRouter()
    const [isLoading, setIsLoading ] = useState(false)

    // Set isClient to true once the component is mounted
    useEffect(() => {
        setIsClient(true)
    }, [])

    // 1. Define your form.
    const form = useForm<z.infer<typeof UserFormValidation>>({
        resolver: zodResolver(UserFormValidation),
        defaultValues: {
            name: "",
            email:"",
            phone:""
        },
    })

    // 2. Define a submit handler.
   async function onSubmit({name, email, phone}: z.infer<typeof UserFormValidation>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        setIsLoading(true)
        try{
           const userData = { name,email,phone };

           const newUser =  await createUser(userData);

           if(newUser) router.push(`/patients/${newUser.$id}/register`)

         
        }catch(error){
            console.log(error)
        }
         setIsLoading(false)

    }

    // Only render the form if we're on the client
    if (!isClient) return null

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
                <section className="mb-12 space-y-4">
                    <h1 className="header">Hi there !</h1>
                    <p className="text-dark-700">Schedule Your First Appointment</p>
                </section>

                <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    control={form.control}
                    name="name"
                    label="Full name"
                    placeholder= "John Doe"
                    iconSrc="/assets/icons/user.svg"
                    iconAlt="user"
                />
                <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    control={form.control}
                    name="email"
                    label="Email"
                    placeholder= "johndoe@jsmastery.pro"
                    iconSrc="/assets/icons/email.svg"
                    iconAlt="email"
                />
                 <CustomFormField
                    fieldType={FormFieldType.PHONE_INPUT}
                    control={form.control}
                    name="phone"
                    label="Phone number"
                    placeholder= "(555) 123-4567"
                />
                <SubmitButton isLoading={isLoading}>Get Started </SubmitButton>
            </form>
        </Form>
    )
}

export default PatientForm