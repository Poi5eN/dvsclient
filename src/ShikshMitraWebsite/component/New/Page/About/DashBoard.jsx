import React from 'react'

const DashBoard = () => {
  return (
    <div>
        <section class="py-10 bg-gray-50 dark:bg-slate-800 sm:py-16 lg:py-24">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="max-w-xl mx-auto text-center">
            {/* <p class="text-sm tracking-widest text-blue-600 dark:text-sky-300 font-bold uppercase">Open Source Theme and UI Components</p> */}

            <h2 class="mt-6 text-3xl font-bold leading-tight text-black dark:text-slate-50 sm:text-4xl lg:text-3xl">Digital Vidya Saarthi – Smart ERP Solution for Modern School Management</h2>
        </div>

        <div class="grid items-center grid-cols-1 mt-12 gap-y-10 lg:grid-cols-5 sm:mt-20 gap-x-4">
            <div class="space-y-8 lg:pr-16 xl:pr-24 lg:col-span-2 lg:space-y-12">
                <div class="flex items-start">
                    <svg class="flex-shrink-0 text-green-500 w-9 h-9" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <div class="ml-5">
                        <h3 class="text-xl font-semibold text-black dark:text-slate-50">Smart School ERP</h3>
                        <p class="mt-3 text-base text-gray-600 dark:text-slate-300">Our ERP automates school operations, including attendance, fee management, and academics, ensuring efficiency, transparency, and seamless communication.</p>
                    </div>
                </div>

                <div class="flex items-start">
                    <svg class="flex-shrink-0 text-blue-600 w-9 h-9" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div class="ml-5">
                        <h3 class="text-xl font-semibold text-black dark:text-slate-50"> Simplified School Administration</h3>
                        <p class="mt-3 text-base text-gray-600 dark:text-slate-300">Manage admissions, payroll, exams, and student records effortlessly with our user-friendly ERP, reducing paperwork and enhancing productivity.</p>
                    </div>
                </div>

                <div class="flex items-start">
                    <svg class="flex-shrink-0 text-red-500 w-9 h-9" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <div class="ml-5">
                        <h3 class="text-xl font-semibold text-black dark:text-slate-50">Enhancing Learning & Communication</h3>
                        <p class="mt-3 text-base text-gray-600 dark:text-slate-300">Teachers, students, and parents stay connected with real-time updates on assignments, grades, and school activities through our ERP.</p>
                    </div>
                </div>
            </div>

            <div class="lg:col-span-3">
                <img class="w-full rounded-lg shadow-xl" src="https://cdn.rareblocks.xyz/collection/celebration/images/features/7/dashboard-screenshot.png" alt="Dashboard screenshot" />
            </div>
        </div>
    </div>
</section>
    </div>
  )
}

export default DashBoard