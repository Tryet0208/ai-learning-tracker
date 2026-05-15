import { useState, useEffect } from "react";
import api from "../api";
import MarkdownView from "../components/MarkdownView";

interface Step {
  order: number;
  title: string;
  content: string;
  download_url?: string;
}

interface Project {
  id: number;
  title: string;
  summary: string;
  difficulty: string;
  tags: string[];
  steps: Step[];
  source_links: { label: string; url: string }[];
}

export default function Workshop() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/projects").then((res) => {
      setProjects(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-2">项目工坊</h1>
      <p className="text-sm text-gray-500 mb-4">每个项目都有保姆级部署指南，跟着步骤走就能成功</p>

      {projects.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm">
          暂无项目，敬请期待
        </div>
      )}

      <div className="space-y-4">
        {projects.map((project) => {
          const isExpanded = expandedId === project.id;
          const currentStep = activeStep[project.id] || 0;

          return (
            <div key={project.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(isExpanded ? null : project.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800">{project.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{project.summary}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        project.difficulty === "入门" ? "bg-green-100 text-green-700" :
                        project.difficulty === "进阶" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {project.difficulty}
                      </span>
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <span className={`text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}>▶</span>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t p-4">
                  <div className="flex gap-1 mb-6">
                    {project.steps.map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${
                        i < currentStep ? "bg-green-500" :
                        i === currentStep ? "bg-blue-500" :
                        "bg-gray-200"
                      }`} />
                    ))}
                  </div>

                  {project.steps.map((step, i) => (
                    <div key={i} className={i === currentStep ? "" : "hidden"}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                          {step.order}
                        </span>
                        <h4 className="font-bold text-gray-800">{step.title}</h4>
                      </div>
                      <div className="ml-11 mb-4">
                        <MarkdownView content={step.content} />
                        {step.download_url && (
                          <a
                            href={step.download_url}
                            className="inline-block mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                            download
                          >
                            下载资源包
                          </a>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between mt-4 ml-11">
                    <button
                      onClick={() => setActiveStep({ ...activeStep, [project.id]: Math.max(0, currentStep - 1) })}
                      disabled={currentStep === 0}
                      className="px-4 py-2 text-sm bg-gray-100 rounded-lg disabled:opacity-30"
                    >
                      上一步
                    </button>
                    <span className="text-sm text-gray-400">
                      {currentStep + 1} / {project.steps.length}
                    </span>
                    <button
                      onClick={() => setActiveStep({ ...activeStep, [project.id]: Math.min(project.steps.length - 1, currentStep + 1) })}
                      disabled={currentStep >= project.steps.length - 1}
                      className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg disabled:opacity-30"
                    >
                      {currentStep >= project.steps.length - 1 ? "已完成" : "下一步"}
                    </button>
                  </div>

                  {project.source_links.length > 0 && (
                    <div className="mt-6 pt-4 border-t ml-11">
                      <p className="text-xs text-gray-400 mb-2">项目来源：</p>
                      {project.source_links.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                           className="text-sm text-blue-500 hover:underline mr-4">
                          {link.label}
                        </a>
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
