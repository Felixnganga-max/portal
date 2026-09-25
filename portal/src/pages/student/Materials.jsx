import { FileText } from "lucide-react";
import Panel, { PageHeader, ListRow } from "../../components/layouts/Panel";
import FileLink from "../../components/layouts/FileLink";
import { units, myUnitIds } from "../../lib/mockData";
import { useTeaching } from "../../lib/teachingStore";

const Materials = () => {
  const { materials } = useTeaching(); // TODO(api): GET /materials?mine=true

  return (
    <div>
      <PageHeader
        title="Materials"
        subtitle="Notes and resources shared by your instructors"
      />
      <div className="max-w-4xl flex flex-col gap-5">
        {units
          .filter((u) => myUnitIds.includes(u._id))
          .map((u) => {
            const list = materials.filter((m) => m.unitId === u._id);
            return (
              <Panel key={u._id} title={`${u.code} — ${u.name}`} flush>
                {list.length === 0 && (
                  <p className="px-5 pb-5 text-xs text-subtle">
                    Nothing shared yet.
                  </p>
                )}
                {list.map((m, i) => (
                  <div
                    key={m.id}
                    className={i === 0 ? "[&>div]:border-t-0" : ""}
                  >
                    <ListRow
                      icon={FileText}
                      title={m.title}
                      meta={
                        <span className="inline-flex items-center gap-2 flex-wrap">
                          {m.description && `${m.description} · `}
                          {new Date(m.postedAt).toLocaleDateString()} ·{" "}
                          <FileLink file={m.file} />
                        </span>
                      }
                    />
                  </div>
                ))}
              </Panel>
            );
          })}
      </div>
    </div>
  );
};

export default Materials;
