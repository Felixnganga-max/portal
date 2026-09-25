import { Trash2 } from "lucide-react";
import Panel, { PageHeader } from "../../components/layouts/Panel";
import { useAttachments, actions, finalMark } from "../../lib/Attachmentstore";
import { gradeFor } from "../../lib/mockData";

const statuses = ["submitted", "approved", "completed", "rejected"];

// Admin sees every department and can override any status or remove a placement.
const AdminAttachment = () => {
  const placements = useAttachments(); // TODO(api): GET /attachments (all departments)
  const count = (s) => placements.filter((p) => p.status === s).length;
  const stats = [
    ["Total placements", placements.length],
    ["Awaiting approval", count("submitted")],
    ["Ongoing", count("approved")],
    ["Completed", count("completed")],
  ];

  return (
    <div>
      <PageHeader
        title="Attachment"
        subtitle="All placements across departments"
      />
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(([label, value]) => (
            <Panel key={label}>
              <p className="text-xs text-subtle">{label}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </Panel>
          ))}
        </div>

        <Panel flush>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-subtle text-xs bg-canvas">
                  <th className="px-5 py-2.5 font-medium">Student</th>
                  <th className="px-5 py-2.5 font-medium">Department</th>
                  <th className="px-5 py-2.5 font-medium">Organisation</th>
                  <th className="px-5 py-2.5 font-medium">
                    Instructor / assessment
                  </th>
                  <th className="px-5 py-2.5 font-medium text-right">
                    Final mark
                  </th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {placements.map((p) => {
                  const mark = finalMark(p);
                  return (
                    <tr
                      key={p.id}
                      className="border-t border-line hover:bg-canvas"
                    >
                      <td className="px-5 py-3">
                        <p className="font-semibold">{p.studentName}</p>
                        <p className="text-xs text-subtle font-mono">
                          {p.admissionNumber}
                        </p>
                      </td>
                      <td className="px-5 py-3">{p.department}</td>
                      <td className="px-5 py-3">
                        {p.organisation}
                        <p className="text-xs text-subtle">{p.location}</p>
                      </td>
                      <td className="px-5 py-3 text-xs">
                        {p.instructor || "Unassigned"}
                        <p className="text-subtle">
                          {p.assessment?.date
                            ? new Date(p.assessment.date).toLocaleDateString()
                            : "No assessment scheduled"}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold">
                        {mark !== null ? `${mark}% (${gradeFor(mark)})` : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={p.status}
                          onChange={(e) =>
                            actions.setStatus(p.id, e.target.value)
                          }
                          className="border border-line rounded px-2 py-1 text-xs capitalize"
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => actions.remove(p.id)}
                          className="text-subtle hover:text-badge"
                          aria-label="Delete placement"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {placements.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-subtle"
                    >
                      No placements yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default AdminAttachment;
