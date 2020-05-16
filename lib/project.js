const uuidAPIKey = require('uuid-apikey');
const Project = require('../schemas/project');
const Team = require('../schemas/team');
const User = require('../schemas/user');

// PATCH PROJECT
const patchProject = async (projectId, userId, values) => {
  const project = await Project.findOne({
    _id: projectId,
  });

  if (project._team) {
    const team = await Team.findOne({
      _id: project._team,
      'members._user': { $in: userId },
      'members.role': 'admin',
    });

    if (!team) {
      return;
    }

    const patchedProject = await Project.findOneAndUpdate(
      { _id: project._id },
      values,
      { new: true, useFindAndModify: false },
    );

    return patchedProject;
  }

  const patchedProject = await Project.findOneAndUpdate(
    { _id: projectId, _createdBy: userId },
    values,
    { new: true, useFindAndModify: false },
  );

  return patchedProject;
};

// PATCH PROJECT API TOKEN
const patchProjectToken = async (projectId, userId) => {
  const project = await patchProject(projectId, userId, {
    apiKey: uuidAPIKey.create().apiKey,
  });

  return project;
};

// DELETE PROJECT
const deleteProject = async (projectId, userId) => {
  const project = await Project.findOne({ _id: projectId });

  if (project._team) {
    const userTeams = await Team.find({
      'members._user': { $in: userId },
    }).select('_id members');

    const userAdminTeams = userTeams.filter((team) => team.members.find(
      (member) => String(member._user) === userId && member.role === 'admin',
    ));

    await Project.deleteOne({
      _id: projectId,
      _team: { $in: userAdminTeams },
    });

    return true;
  }
  await Project.deleteOne({
    _id: projectId,
    _createdBy: userId,
  });

  return true;
};

// GET PROJECT
const getProject = async (projectId) => {
  const project = await Project.findOne({ _id: projectId }).populate({
    path: '_createdBy _team',
    select: 'name',
  });

  return project;
};

// GET USER PROJECTS
const getUserProjects = async (userId) => {
  const user = await User.findOne({ _id: userId });

  const userTeams = await Team.find({
    'members._user': { $in: user._id },
  }).select('_id');

  const teamProjects = await Project.find({
    _team: { $in: userTeams },
  });

  const userProjects = await Project.find({
    _team: null,
    _createdBy: user._id,
  });

  return [...teamProjects, ...userProjects];
};

// CREATE PROJECT
const createProject = async (userId, values) => {
  const user = await User.findOne({ _id: userId });
  const { name, team: teamId } = values;

  const team = await Team.findOne({ _id: teamId });

  const project = await Project.create({
    name,
    _team: team ? team._id : undefined,
    _createdBy: user._id,
    apiKey: uuidAPIKey.create().apiKey,
  });

  return project;
};

module.exports = {
  patchProject,
  patchProjectToken,
  deleteProject,
  getProject,
  getUserProjects,
  createProject,
};
