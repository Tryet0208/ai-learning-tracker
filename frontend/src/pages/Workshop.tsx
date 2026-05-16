import { useState, useEffect } from "react";
import api from "../api";
import MarkdownView from "../components/MarkdownView";

interface Step { order: number; title: string; content: string; download_url?: string; }
interface Project { id: number; title: string; summary: string; difficulty: string; tags: string[]; steps: Step[]; source_links: { label: string; url: string }[]; }

export default function Workshop() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/projects").then((res) => { setProjects(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-24 text-center text-base text-gray-500 dark:text-gray-400">加载中</div>;

  return (
    <div className="space-y-12 pb-24">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-wider">项目工坊</h2>
        <p className="text-base text-gray-500 dark:text-gray-400 mt-2">保姆级部署指南，跟着步骤走就能成功</p>
      </div>

      {projects.length === 0 && (
        <div className="border border-gray-100 dark:border-gray-800 rounded-lg py-20 text-center text-base text-gray-500 dark:text-gray-500">暂无项目</div>
      )}

      <div className="space-y-4">
        {projects.map((project) => {
          const isExpanded = expandedId === project.id;
          const currentStep = activeStep[project.id] || 0;

          return (
            <div key={project.id} className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
              <div className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors"
                   onClick={() => setExpandedId(isExpanded ? null : project.id)}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{project.title}</h3>
                    <p className="text-base text-gray-500 dark:text-gray-400 mt-2">{project.summary}</p>
                    <div className="flex gap-2 mt-4">
                      <span className="text-xs text-gray-500 dark:text-gray-500 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded">{project.difficulty}</span>
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-xs text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-neutral-900 px-2 py-1 rounded">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <span className={`text-base text-gray-500 dark:text-gray-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}>&#8250;</span>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-800 p-6">
                  <div className="flex gap-1.5 mb-10">
                    {project.steps.map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= currentStep ? "bg-gray-900 dark:bg-gray-100" : "bg-gray-100 dark:bg-gray-800"}`} />
                    ))}
                  </div>

                  {project.steps.map((step, i) => (
                    <div key={i} className={i === currentStep ? "" : "hidden"}>
                      <div className="flex items-center gap-5 mb-5">
                        <span className="w-9 h-9 rounded-full border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center text-base font-bold">
                          {step.order}
                        </span>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{step.title}</h4>
                      </div>
                      <div className="ml-14 mb-8">
                        <MarkdownView content={step.content} />
                        {step.download_url && (
                          <a href={step.download_url}
                             className="inline-block mt-5 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-base hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors" download>
                            下载资源包
                          </a>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between items-center ml-14 pt-5 border-t border-gray-100 dark:border-gray-800">
                    <button onClick={() => setActiveStep({ ...activeStep, [project.id]: Math.max(0, currentStep - 1) })}
                            disabled={currentStep === 0}
                            className="text-base text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-20 transition-colors">
                      ← 上一步
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-500">{currentStep + 1}/{project.steps.length}</span>
                    <button onClick={() => setActiveStep({ ...activeStep, [project.id]: Math.min(project.steps.length - 1, currentStep + 1) })}
                            disabled={currentStep >= project.steps.length - 1}
                            className="text-base text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-20 transition-colors font-bold">
                      {currentStep >= project.steps.length - 1 ? "完成" : "下一步 →"}
                    </button>
                  </div>

                  {project.source_links.length > 0 && (
                    <div className="mt-8 pt-5 border-t border-gray-100 dark:border-gray-800 ml-14">
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-3 tracking-widest">项目来源</p>
                      {project.source_links.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                           className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mr-8 transition-colors">{link.label}</a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
