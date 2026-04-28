import { useState, useEffect } from "react";
import {
  LayoutGrid,
  LayoutList,
  Plus,
  Search,
  MoreVertical,
  User,
  Edit2,
  Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import { projectService } from "../services/supabaseService";

const STATUS_OPTIONS = ["pending", "active", "completed"] as const;

const inputCls =
  "w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

const submitBtn =
  "bg-indigo-600 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-indigo-700";

const cancelBtn =
  "bg-slate-100 text-slate-600 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-200";

const blankProject = {
  name: "",
  client_name: "",
  budget: "",
  start_date: "",
  end_date: "",
  status: "pending",
  description: ""
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  active: "bg-indigo-100 text-indigo-700",
  completed: "bg-emerald-100 text-emerald-700"
};

function Modal({ title, onClose, children }: any) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: .95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-xl"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="font-bold text-slate-900">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-xl text-slate-400 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function FormField({ label, children }: any) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editing, setEditing] = useState<any>(null);

  const [form, setForm] = useState<any>(blankProject);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);

    try {
      const res = await projectService.getAll();

      // FIX FOR filter error
      const data = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];

      setProjects(data);
    } catch (error) {
      console.error("Fetch Error:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        budget: Number(form.budget)
      };

      if (editing) {
        await projectService.update(
          editing.id,
          payload
        );
      } else {
        await projectService.create(
          payload
        );
      }

      setForm(blankProject);
      setEditing(null);
      setShowForm(false);

      fetchProjects();

    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete project?")) return;

    try {
      await projectService.delete(id);
      fetchProjects();
    } catch (error) {
      console.error(error);
    }
  }

  function openEdit(p: any) {
    setEditing(p);

    setForm({
      name: p.name || "",
      client_name: p.client_name || "",
      budget: p.budget || "",
      start_date: p.start_date || "",
      end_date: p.end_date || "",
      status: p.status || "pending",
      description: p.description || ""
    });

    setShowForm(true);
  }

  // SAFE FILTER
  const filtered = (
    Array.isArray(projects)
      ? projects
      : []
  ).filter((p: any) =>
    !search ||
    p?.name?.toLowerCase().includes(
      search.toLowerCase()
    ) ||
    p?.client_name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold">
            Project Management
          </h1>

          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">
            All Projects & Site Inventory
          </p>
        </div>

        <button
          onClick={()=>{
            setEditing(null);
            setForm(blankProject);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded text-xs font-bold"
        >
          <Plus size={14}/>
          New Project
        </button>
      </div>

      {/* toolbar */}

      <div className="bg-white border rounded shadow-sm p-4 flex justify-between items-center">

        <div className="flex items-center gap-2 w-full max-w-sm">
          <Search size={14}/>
          <input
            value={search}
            onChange={(e)=>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search projects..."
            className="w-full outline-none text-sm"
          />
        </div>

        <div className="flex bg-slate-50 rounded p-1 border">
          <button
            onClick={()=>
              setView("grid")
            }
            className={`p-1 rounded ${
              view==="grid"
                ? "bg-white shadow text-indigo-600"
                : ""
            }`}
          >
            <LayoutGrid size={16}/>
          </button>

          <button
            onClick={()=>
              setView("list")
            }
            className={`p-1 rounded ${
              view==="list"
                ? "bg-white shadow text-indigo-600"
                : ""
            }`}
          >
            <LayoutList size={16}/>
          </button>
        </div>

      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"/>
        </div>
      ) : filtered.length===0 ? (
        <div className="py-20 text-center border-2 border-dashed rounded-lg">
          No Projects Found
        </div>
      ) : view==="grid" ? (

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p:any)=>(
            <ProjectCard
              key={p.id}
              project={p}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

      ) : (

        <div className="bg-white border rounded shadow-sm overflow-hidden">

          <table className="w-full">
            <thead className="bg-slate-50 text-xs">
              <tr>
                <th className="p-4 text-left">
                  Project
                </th>

                <th className="p-4 text-left">
                  Client
                </th>

                <th className="p-4 text-left">
                  Budget
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

                <th className="p-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((p:any)=>(
                <tr
                  key={p.id}
                  className="border-t text-sm"
                >
                  <td className="p-4 font-semibold">
                    {p.name}
                  </td>

                  <td className="p-4">
                    {p.client_name}
                  </td>

                  <td className="p-4">
                    $
                    {Number(
                      p.budget
                    ).toLocaleString()}
                  </td>

                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[p.status]}`}>
                      {p.status}
                    </span>
                  </td>

                  <td className="p-4 flex justify-end gap-2">
                    <button
                      onClick={()=>
                        openEdit(p)
                      }
                    >
                      <Edit2 size={15}/>
                    </button>

                    <button
                      onClick={()=>
                        handleDelete(
                          p.id
                        )
                      }
                    >
                      <Trash2 size={15}/>
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

      {showForm && (
        <Modal
          title={
            editing
            ? "Edit Project"
            : "New Project"
          }
          onClose={()=>{
            setShowForm(false);
            setEditing(null);
          }}
        >

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Project Name">
                <input
                  className={inputCls}
                  value={form.name}
                  onChange={(e)=>
                    setForm({
                      ...form,
                      name:e.target.value
                    })
                  }
                />
              </FormField>

              <FormField label="Client Name">
                <input
                  className={inputCls}
                  value={form.client_name}
                  onChange={(e)=>
                    setForm({
                      ...form,
                      client_name:e.target.value
                    })
                  }
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">

              <FormField label="Budget">
                <input
                  type="number"
                  className={inputCls}
                  value={form.budget}
                  onChange={(e)=>
                    setForm({
                      ...form,
                      budget:e.target.value
                    })
                  }
                />
              </FormField>

              <FormField label="Status">
                <select
                  className={inputCls}
                  value={form.status}
                  onChange={(e)=>
                    setForm({
                      ...form,
                      status:e.target.value
                    })
                  }
                >
                  {STATUS_OPTIONS.map(s=>(
                    <option key={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </FormField>

            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Start Date">
                <input
                  type="date"
                  className={inputCls}
                  value={form.start_date}
                  onChange={(e)=>
                    setForm({
                      ...form,
                      start_date:e.target.value
                    })
                  }
                />
              </FormField>

              <FormField label="End Date">
                <input
                  type="date"
                  className={inputCls}
                  value={form.end_date}
                  onChange={(e)=>
                    setForm({
                      ...form,
                      end_date:e.target.value
                    })
                  }
                />
              </FormField>
            </div>

            <FormField label="Description">
              <textarea
                rows={3}
                className={inputCls}
                value={form.description}
                onChange={(e)=>
                  setForm({
                    ...form,
                    description:e.target.value
                  })
                }
              />
            </FormField>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={()=>
                  setShowForm(false)
                }
                className={cancelBtn}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={submitBtn}
              >
                {
                  editing
                  ? "Update"
                  : "Create"
                }
              </button>
            </div>

          </form>

        </Modal>
      )}

    </div>
  );
}

function ProjectCard({
  project:p,
  onEdit,
  onDelete
}:any){

const [menuOpen,setMenuOpen]=useState(false);

return(
<motion.div
initial={{
 opacity:0,
 y:10
}}
animate={{
 opacity:1,
 y:0
}}
className="bg-white border rounded-lg shadow-sm overflow-hidden"
>

<div className="p-5">

<div className="flex justify-between mb-4">
<span className={`px-2 py-1 rounded text-xs ${statusColors[p.status]}`}>
{p.status}
</span>

<div className="relative">
<button
onClick={()=>
setMenuOpen(!menuOpen)
}
>
<MoreVertical size={16}/>
</button>

{menuOpen && (
<div className="absolute right-0 top-6 bg-white border rounded shadow w-32">
<button
onClick={()=>{
onEdit(p);
setMenuOpen(false);
}}
className="w-full text-left p-2 text-xs hover:bg-slate-50"
>
Edit
</button>

<button
onClick={()=>{
onDelete(p.id);
setMenuOpen(false);
}}
className="w-full text-left p-2 text-xs hover:bg-red-50 text-red-600"
>
Delete
</button>
</div>
)}
</div>

</div>

<h3 className="font-bold">
{p.name}
</h3>

<p className="text-xs text-slate-500 flex gap-1 items-center mt-1">
<User size={12}/>
{p.client_name}
</p>

<div className="mt-5 border-t pt-4 space-y-2 text-xs">

<div className="flex justify-between">
<span>Budget</span>
<span>
$
{Number(
p.budget
).toLocaleString()}
</span>
</div>

<div className="flex justify-between">
<span>Start</span>
<span>
{p.start_date || "TBD"}
</span>
</div>

</div>

</div>

<div className="px-5 py-3 bg-slate-50 text-[10px] uppercase">
Updated{" "}
{new Date(
p.updated_at || p.created_at
).toLocaleDateString()}
</div>

</motion.div>
)
}