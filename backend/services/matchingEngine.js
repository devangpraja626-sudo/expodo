function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

function words(value) {
  return normalize(value)
    .split(/[,\s]+/)
    .map(word => word.trim())
    .filter(Boolean);
}

function skillMatch(firstSkills = [], secondSkills = []) {
  const first = firstSkills.map(normalize).filter(Boolean);
  const second = secondSkills.map(normalize).filter(Boolean);

  if (!first.length || !second.length) {
    return 0;
  }

  let matched = 0;

  first.forEach(skill => {
    const found = second.some(otherSkill =>
      otherSkill.includes(skill) ||
      skill.includes(otherSkill)
    );

    if (found) {
      matched++;
    }
  });

  return matched / first.length;
}

function textMatch(first, second) {
  const a = normalize(first);
  const b = normalize(second);

  if (!a || !b) {
    return 0;
  }

  if (a === b) {
    return 1;
  }

  if (a.includes(b) || b.includes(a)) {
    return 0.8;
  }

  const aWords = words(a);
  const bWords = words(b);

  const overlap = aWords.filter(word =>
    bWords.includes(word)
  ).length;

  if (!overlap) {
    return 0;
  }

  return Math.min(
    overlap / Math.max(aWords.length, bWords.length),
    1
  );
}

function experienceMatch(employeeExperience, employerRequirement) {
  const employee = normalize(employeeExperience);
  const required = normalize(employerRequirement);

  if (!employee || !required) {
    return 0;
  }

  const employeeYears =
    employee.match(/\d+(?:\.\d+)?/)?.[0];

  const requiredYears =
    required.match(/\d+(?:\.\d+)?/)?.[0];

  if (employeeYears && requiredYears) {
    const employeeNumber = Number(employeeYears);
    const requiredNumber = Number(requiredYears);

    if (employeeNumber >= requiredNumber) {
      return 1;
    }

    if (employeeNumber >= requiredNumber * 0.5) {
      return 0.5;
    }

    return 0;
  }

  return textMatch(employee, required);
}

function calculateMatch(employee, employer) {
  const skillScore = skillMatch(
    employer.required_skills || [],
    employee.skills || []
  );

  const positionScore = textMatch(
    employee.desired_position,
    employer.hiring_position
  );

  const experienceScore = experienceMatch(
    employee.experience,
    employer.experience_required
  );

  const locationScore = textMatch(
    employee.location,
    employer.location
  );

  const workScore = textMatch(
    employee.work_preference,
    employer.work_type
  );

  const total =
    skillScore * 45 +
    positionScore * 25 +
    experienceScore * 15 +
    locationScore * 10 +
    workScore * 5;

  const matchedOn = [];

  if (skillScore >= 0.5) {
    matchedOn.push("Skills");
  }

  if (positionScore >= 0.5) {
    matchedOn.push("Position");
  }

  if (experienceScore >= 0.5) {
    matchedOn.push("Experience");
  }

  if (locationScore >= 0.5) {
    matchedOn.push("Location");
  }

  if (workScore >= 0.5) {
    matchedOn.push("Work preference");
  }

  return {
    matchScore: Math.round(total),
    matchedOn
  };
}

function getMatches(profile, profiles) {
  if (!profile || !profile.role) {
    return [];
  }

  const candidates = profiles.filter(candidate => {
    if (!candidate || candidate.id === profile.id) {
      return false;
    }

    if (profile.role === "employee") {
      return candidate.role === "employer";
    }

    if (profile.role === "employer") {
      return candidate.role === "employee";
    }

    return false;
  });

  const employee =
    profile.role === "employee"
      ? profile
      : null;

  const employer =
    profile.role === "employer"
      ? profile
      : null;

  const results = candidates.map(candidate => {
    const currentEmployee =
      employee || candidate;

    const currentEmployer =
      employer || candidate;

    const score = calculateMatch(
      currentEmployee,
      currentEmployer
    );

    return {
      profile: candidate,
      matchScore: score.matchScore,
      matchedOn: score.matchedOn
    };
  });

  return results
    .filter(match => match.matchScore > 0)
    .sort(
      (a, b) =>
        b.matchScore - a.matchScore
    )
    .slice(0, 20);
}

module.exports = {
  calculateMatch,
  getMatches
};