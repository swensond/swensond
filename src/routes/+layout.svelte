<script>
    import "./layout.css";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { DevicePhoneMobile, Envelope, MapPin } from "@steeze-ui/heroicons";
    // @ts-ignore
    import SocialIcons from "@rodneylab/svelte-social-icons";

    let information = [
        {
            content: "Millbury, MA",
            icon: MapPin,
        },
        {
            content: "david@swensond.com",
            icon: Envelope,
        },
        {
            content: "(508) 579-6980",
            icon: DevicePhoneMobile,
        },
    ];

    let { children } = $props();
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Header Section - Contact Information Only -->
    <header class="bg-white border border-zinc-200 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-8 mb-12">
        <div class="flex flex-col md:flex-row items-center gap-8">
            <!-- Profile Image -->
            <div class="flex-shrink-0 relative">
                <div class="absolute inset-0 rounded-full bg-white/5 blur-xl scale-110"></div>
                <div class="relative rounded-full p-[2px] bg-gradient-to-br from-zinc-600 via-zinc-400 to-zinc-700">
                    <img
                        class="w-48 h-48 rounded-full bg-zinc-950"
                        src="avatar.png"
                        alt="David Swenson"
                    />
                </div>
            </div>

            <!-- Profile Info -->
            <div class="flex-1 text-center md:text-left">
                <h1 class="text-4xl font-bold mb-2">
                    David <span class="text-slate-500">Swenson</span>
                </h1>

                <!-- Social Links -->
                <div class="flex gap-6 justify-center md:justify-start my-4">
                    <a
                        href="https://github.com/swensond"
                        target="_blank"
                        aria-label="Visit GitHub profile"
                        title="GitHub"
                    >
                        <SocialIcons alt="" network="github" />
                    </a>
                    <a
                        href="https://www.linkedin.com/in/swensond/"
                        target="_blank"
                        aria-label="Visit LinkedIn profile"
                        title="LinkedIn"
                    >
                        <SocialIcons alt="" network="linkedin" />
                    </a>
                </div>

                <!-- Contact Information Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {#each information as info}
                        <div class="flex items-center gap-3">
                            <span
                                class="flex size-8 items-center justify-center rounded-full bg-slate-700"
                            >
                                <Icon
                                    src={info.icon}
                                    theme="solid"
                                    class="p-1 items-center justify-center rounded-full bg-slate-700 text-white"
                                />
                            </span>
                            <p class="text-sm text-slate-600">{info.content}</p>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content - This can be replaced with other content -->
    <main class="bg-white border border-zinc-200 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-8">
        {@render children()}
    </main>
</div>
