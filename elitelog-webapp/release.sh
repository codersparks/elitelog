# Script that will perform a release of elite log

if [[ $# < 2 ]] || [[ $# >3 ]]
then
	echo "Usage $0 [elitelog base folder] [openshift base folder] [optional:tag]"
	exit 1
fi

ELITELOG_BASE_DIR=$1
OPENSHIFT_BASE_DIR=$2

if [[ $# == 2 ]]
then
	TAG=$(date +%Y%m%d%H%M%S)
else
	TAG=$3
fi

echo "Using elitelog dir: ......... $ELITELOG_BASE_DIR"
echo "Using elitelog openshift dir: $OPENSHIFT_BASE_DIR"
echo "Using tag: .................. $TAG"

echo -e "\nPreparing elite log..."

pushd $ELITELOG_BASE_DIR

if [[ $? != 0 ]]
then
	echo "Error changing to elitelog dir: $ELITELOG_BASE_DIR"
	exit 1
fi

if [[ $(git status | grep "nothing to commit, working directory clean" | wc -l) -eq "1" ]]
then 
	echo "No uncommited changes...continuing"
else 
	echo "Uncommitted changes...cannot continue"
	exit 2
fi

echo -e "\nBuilding elite log..."

mvn clean package

if [[ $? != 0 ]]
then
  echo "Maven return non zero exit code"
  exit 1
fi
echo -e "\nTagging repository with tag 'elitelog-$TAG'"
git tag -a "elitelog-$TAG" -m "Adding tag: elitelog-$TAG"
git push origin elitelog-$TAG 
popd

echo -e "Copying war to $OPENSHIFT_BASE_DIR/webapps/ROOT.war"
cp $ELITELOG_BASE_DIR/target/elitelog.war $OPENSHIFT_BASE_DIR/webapps/ROOT.war

echo -e "\nPublishing to openshift"

pushd $OPENSHIFT_BASE_DIR

echo "Committing changes"
git commit -am "Commiting changes under tag: elitelog-$TAG"
git push

popd
