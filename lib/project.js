const uuidAPIKey = require('uuid-apikey');
const Project = require('../schemas/project');
const Team = require('../schemas/team');

const patchProject = async (projectId, userId, values) => {
  // Find current project
  const project = await Project.findOne({
    _id: projectId,
  });

  if (project._team) {
    // Find project team and make sure user is admin
    const team = await Team.findOne({
      _id: project._team,
      'members._user': { $in: userId },
      'members.role': 'admin',
    });

    // If not, return unauthorized
    if (!team) {
      return;
    }

    // Patch project
    const patchedProject = await Project.findOneAndUpdate(
      { _id: project._id },
      values,
      { new: true, useFindAndModify: false },
    );

    // Return patched project
    return patchedProject;
  }

  // If project doesn't belong to a team, just patch
  // & make sure the user is the creator of the project
  const patchedProject = await Project.findOneAndUpdate(
    { _id: projectId, _createdBy: userId },
    values,
    { new: true, useFindAndModify: false },
  );

  // If not, return unauthorized
  if (!patchedProject) {
    return;
  }

  // Return patched project
  return patchedProject;
};

const patchProjectToken = async (projectId, userId) => {
  const project = await patchProject(projectId, userId, {
    apiKey: uuidAPIKey.create().apiKey,
  });

  if (!project) {
    return;
  }

  return project;
};

module.exports = {
  patchProject,
  patchProjectToken,
};
