import {
  Server,
  Activity,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  HardDrive,
} from "lucide-react";

const services = [
  {
    name: "Frontend",
    status: "Operational",
    icon: Activity,
  },
  {
    name: "API Server",
    status: "Operational",
    icon: Server,
  },
  {
    name: "Database",
    status: "Operational",
    icon: Database,
  },
  {
    name: "Authentication",
    status: "Operational",
    icon: ShieldCheck,
  },
];

export default function System() {
  return (
    <div className="min-h-full bg-slate-50">

      {/* Header */}

      <div className="border-b border-slate-200 bg-white">
        <div className="px-4 py-6 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Server size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                System
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Monitor application services and system health.
              </p>
            </div>

          </div>

        </div>
      </div>


      {/* Content */}

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">

        {/* Overall status */}

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <h2 className="font-bold text-emerald-900">
                All Systems Operational
              </h2>

              <p className="mt-1 text-sm text-emerald-700">
                No system issues have been detected.
              </p>
            </div>

          </div>

        </div>


        {/* Services */}

        <div>

          <h2 className="mb-4 text-lg font-bold text-slate-900">
            Services
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {services.map((service) => {
              const Icon = service.icon;

              return (
                <div
                  key={service.name}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
                        <Icon size={19} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {service.name}
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Running normally
                        </p>
                      </div>

                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={13} />
                      {service.status}
                    </span>

                  </div>

                </div>
              );
            })}

          </div>

        </div>


        {/* System resources */}

        <div>

          <h2 className="mb-4 text-lg font-bold text-slate-900">
            System Resources
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <ResourceCard
              icon={Cpu}
              title="CPU Usage"
              value="24%"
              description="Normal"
            />

            <ResourceCard
              icon={HardDrive}
              title="Storage"
              value="38%"
              description="Healthy"
            />

          </div>

        </div>


        {/* Warning */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex gap-3">

            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <AlertTriangle size={19} />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">
                System monitoring
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Detailed system metrics will be connected to the
                Django backend once the API and monitoring services
                are configured.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

function ResourceCard({
  icon: Icon,
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
            <Icon size={19} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700">
              {title}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {description}
            </p>
          </div>

        </div>

        <p className="text-2xl font-bold text-slate-900">
          {value}
        </p>

      </div>

    </div>
  );
}