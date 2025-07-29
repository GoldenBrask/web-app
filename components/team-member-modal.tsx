"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Linkedin, Mail, X } from "lucide-react"
import Image from "next/image"
import type { TeamMember } from "@/lib/types"

interface TeamMemberModalProps {
  member: TeamMember | null
  isOpen: boolean
  onClose: () => void
}

export function TeamMemberModal({ member, isOpen, onClose }: TeamMemberModalProps) {
  if (!member) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Profil de {member.name}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <Image
              src={member.image || "/placeholder.svg"}
              width="150"
              height="150"
              alt={member.name}
              className="rounded-full"
            />
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-2xl font-bold dark:text-white">{member.name}</h3>
              <p className="text-blue-600 font-medium text-lg mb-2">{member.role}</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{member.description}</p>

              {/* Social Links */}
              <div className="flex gap-3 justify-center sm:justify-start">
                {member.linkedin && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {member.email && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${member.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div>
            <h4 className="text-lg font-semibold mb-3 dark:text-white">Compétences</h4>
            <div className="flex flex-wrap gap-2">
              {member.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Experience Section */}
          <div>
            <h4 className="text-lg font-semibold mb-3 dark:text-white">Expérience</h4>
            <p className="text-gray-600 dark:text-gray-300">{member.experience}</p>
          </div>

          {/* Education Section */}
          <div>
            <h4 className="text-lg font-semibold mb-3 dark:text-white">Formation</h4>
            <p className="text-gray-600 dark:text-gray-300">{member.education}</p>
          </div>

          {/* Projects Section */}
          <div>
            <h4 className="text-lg font-semibold mb-3 dark:text-white">Projets récents</h4>
            <ul className="space-y-2">
              {member.projects.map((project, index) => (
                <li key={index} className="text-gray-600 dark:text-gray-300 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  {project}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
